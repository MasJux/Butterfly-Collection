sap.ui.define(
[
'sap/ui/core/Item',
'sap/m/ComboBox',
'sap/m/Dialog',
'sap/m/Button',
'sap/m/MessageToast',
'sap/m/Text',
'../utils/Formatters'
], 

function(Item, ComboBox, Dialog, Button, MessageToast, Text, Formatters) {
    'use strict';

    return {
        changeDataValue(controller) {
            const dataTable = controller.byId('butterfliesTable');
            const columns = dataTable.getColumns();
            const oDataModel = controller.getView().getModel('butterfliesModel');
            const butterfliesData = oDataModel.getProperty('/butterflies');
            const viewModel = controller.getView().getModel("viewModel");
            const columnStates = viewModel.getProperty("/columnStates") || {};
            const i18nModel = controller.getView().getModel("i18n");
            const cancel = i18nModel.getResourceBundle().getText("cancel");
            const save = i18nModel.getResourceBundle().getText("save");
            const changedValues = i18nModel.getResourceBundle().getText("changedValues");
            const chooseColumnForChange = i18nModel.getResourceBundle().getText("chooseColumnForChange");
    
            const dataType={
                "GUID": "String",
                "Name": "String",
                "Family": "String",
                "Location": "String",
                "Wingspan": "Number",
                "Weight": "Number",
                "Price": "Number",
                "Abundance": "Number",
                "Color Rating": "Number",
                "Lifespan": "Number",
                "Habitat": "String",
                "Migration Pattern": "String",
                "Threat Level": "String"
                }
    
            const options = columns.map((column) => {
                const columnProperty = column.getFilterProperty();
                const isUsed = columnStates[columnProperty] === true; //przypisz true kolumnie w której zmieniono już wartość
                
                if(columnProperty === "Date"){ //pomiń date, bo nie pasuje ani do number ani string
                return new Item({
                    enabled: isUsed
                })
                }else{
                return new Item({
                    key: columnProperty,
                    text: columnProperty,
                    enabled: !isUsed
                })
            }
            })
            
            const comboBox = new ComboBox({
            items: options,
            })
            comboBox.addStyleClass("changingDataComboBox");
    
            const changeDataDialog = new Dialog({
            title: chooseColumnForChange,
            content: [comboBox],
            beginButton: new Button({
                text: save,
                press: () => {
                sap.ui.core.BusyIndicator.show(0);
                    const selectedColumn = comboBox.getSelectedKey();
                    console.log(options)
                    
                    butterfliesData.forEach((value, index) => { //sprawdz typ danych      
                    if(dataType[selectedColumn] === "Number" ){
    
                    //ustaw zmienione wartości i dopisz jednostkę, jeżeli posiada
                    if(selectedColumn === "Wingspan"){
                        const finalValue = controller.Formatters.countValue(value, selectedColumn, "mm")
                        oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, finalValue);
                    }else if(selectedColumn === "Weight"){
                        const finalValue = controller.Formatters.countValue(value, selectedColumn, "g")
                        oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, finalValue);
                    }else if(selectedColumn === "Lifespan"){
                        const finalValue = controller.Formatters.countValue(value, selectedColumn, "days")
                        oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, finalValue);
                    }else{
                        const newValue = value[selectedColumn]
                        let changedValue = newValue * 3.3
                        changedValue = changedValue.toFixed(2)
                        oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, changedValue); 
                    }
                    }else{
                    const newValue = value[selectedColumn] += "ed"
                    oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, newValue); //ustaw zmienione wartości
                    }
                });
            //w wykorzystanej wyzej kolumnie ustaw true jako już użyta   
            columnStates[selectedColumn] = true; 
            viewModel.setProperty("/columnStates", columnStates);
    
            // iteruj po wszystkich options, jezeli natrafisz na wyżej użyty to zablokuj go
            const items = comboBox.getItems();
            console.log(items + " items")
            items.forEach((item) => {
                if (item.getKey() === selectedColumn) {
                item.setEnabled(false); 
                }
            });
    
            if(comboBox.getItems().length === 0){
                comboBox.setEnabled(false);
            }
            changeDataDialog.close();
            MessageToast.show(changedValues+" " + selectedColumn);
            sap.ui.core.BusyIndicator.hide();
            }
        }),
            endButton: new Button({
            text: cancel,
            press: () => {
                changeDataDialog.close();
            }
            })
            }).open();
        },

        sumValues(controller) {
            const dataType={
                "GUID": "String",
                "Name": "String",
                "Family": "String",
                "Location": "String",
                "Date": "String",
                "Wingspan": "Number",
                "Weight": "Number",
                "Price": "Number",
                "Abundance": "Number",
                "Color Rating": "Number",
                "Lifespan": "Number",
                "Habitat": "String",
                "Migration Pattern": "String",
                "Threat Level": "String"
                }
                
                let totalSum;
                const dataTable = controller.byId('butterfliesTable');
                const columns = dataTable.getColumns();
                const oDataModel = controller.getView().getModel('butterfliesModel');
                const butterfliesData = oDataModel.getProperty('/butterflies');
                const i18nModel = controller.getView().getModel("i18n");
                const cancel = i18nModel.getResourceBundle().getText("cancel");
                const sum = i18nModel.getResourceBundle().getText("sum");
                const calculateSum = i18nModel.getResourceBundle().getText("countSum");
                const selectColForSum = i18nModel.getResourceBundle().getText("selectColForSum");

                const options = columns.map((column) => {
                const columnProperty = column.getFilterProperty();
                    return new Item({
                    key: columnProperty,
                    text: columnProperty,
                    })
                })

                const result = new Text({
                    text: sum+": 0"
                });

                const comboBox = new ComboBox({
                    items: options,
                })
        
                const countDataDialog = new Dialog({
                    title: selectColForSum,
                    content: [
                    comboBox,
                    result
                ],  
                    beginButton: new Button({
                    text: calculateSum,
                    press: () => {
                        totalSum=0;
        
                        const selectedColumn = comboBox.getSelectedKey();
                        butterfliesData.forEach((value) => { 
                        if(dataType[selectedColumn] === "Number" && value[selectedColumn] !== undefined){
                            totalSum += parseFloat(value[selectedColumn])
                        }
                        })
                        if(dataType[selectedColumn] === "Number"){
                        result.setText(sum +": "+ totalSum.toFixed(2));
                        }else{
                        result.setText(sum+ ": xxxx,xx");
                        }

                    }
                    }),
                    endButton: new Button({
                    text: cancel,
                    press: () => {
                        countDataDialog.close();
                    }
                    })
                }).open();
            }

    }
})
