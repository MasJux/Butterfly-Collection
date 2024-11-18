sap.ui.define(
[
    'sap/ui/table/Column',
    'sap/m/Label',
    'sap/m/Text',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/m/ComboBox',
    'sap/m/Dialog',
    'sap/m/Button',
    '../utils/Formatters'
], 

function(Column, Label, Text, MessageBox, MessageToast, ComboBox, Dialog, Button, Formatters) {
    'use strict';

    return {
        createTable: function (controller) {
        const dataTable = controller.byId('butterfliesTable');
        const oDataModel = controller.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');

        if (butterfliesData && butterfliesData.length > 0) {
        const firstRow = butterfliesData[0];
        console.log(firstRow);  
        const columnsNames = Object.keys(firstRow);
        
        //iteracyjne dodanie kolumn wraz z danymi do dataTable
        columnsNames.forEach((columnName) => {
            dataTable.addColumn(
            new Column({
                id: columnName.replace(/\s+/g, ''), 
                sortProperty: columnName,
                filterProperty: columnName,
                label: new Label({ text: columnName }), 
                template: new Text({ wrapping: false, text: `{butterfliesModel>${columnName}}` })
            }),
            );
        });

        dataTable.bindRows('butterfliesModel>/butterflies');
        }
    },

        editData: function(controller) {
            const dataTable = controller.byId('butterfliesTable');
            const columns = dataTable.getColumns();
            const oDataModel = controller.getView().getModel('butterfliesModel');
            //zapis danych przed edycją
            controller.prevData = JSON.parse(JSON.stringify(
            oDataModel.getProperty('/butterflies')
        ));
        
        if (!controller.bIsEditing) {
            controller.bIsEditing = true;
        
            columns.forEach((column) => {
            const columnId = column.getId();
            const columnProperty = column.getFilterProperty();
            console.log(columnProperty+" :columnProperty");
            let inputTemplate;

            if (columnId === 'Date'){
                inputTemplate = new sap.m.Input({
                value: `{butterfliesModel>${columnProperty}}`,
                type: 'Date'
                });
            }
            else if (columnId === 'Wingspan'){
                inputTemplate = controller.Formatters.formatCellsOnEdit(columnProperty, "mm", oDataModel);
            }
            else if(columnId === 'Weight'){
                inputTemplate = controller.Formatters.formatCellsOnEdit(columnProperty, "g", oDataModel);
            }
            else if(columnId === 'Price') {
                inputTemplate = new sap.m.Input({
                value: `{butterfliesModel>${columnProperty}}`,
                type: 'Number'
                });
            }
            else if(columnId === 'Abundance') {
                inputTemplate = new sap.m.Input({
                value: `{butterfliesModel>${columnProperty}}`,
                type: 'Number'
                });
            }
            else if(columnId === 'ColorRating') {
                inputTemplate = new sap.m.Input({
                value: `{butterfliesModel>${columnProperty}}`,
                type: 'Number'
                });
            }
            else if(columnId === 'Lifespan') {
                inputTemplate = controller.Formatters.formatCellsOnEdit(columnProperty, "days", oDataModel);
            }
            else {
                inputTemplate = new sap.m.Input({
                value: `{butterfliesModel>${columnProperty}}`,
                });
            }

            column.setTemplate(inputTemplate);
            });
            sap.ui.core.BusyIndicator.hide();
            controller.editButton.setVisible(false);
            controller.saveButton.setVisible(true);
            }
        },

        saveData: function(controller) {
            const dataTable = controller.byId('butterfliesTable');
            const columns = dataTable.getColumns();
            const oDataModel = controller.getView().getModel('butterfliesModel');
            const i18nModel = controller.getView().getModel("i18n");
            const saveDataQuestion = i18nModel.getResourceBundle().getText("saveDataQuestion");

            console.log(controller.prevDat);
            sap.ui.core.BusyIndicator.show(0);

            MessageBox.confirm(saveDataQuestion,{
                onClose: (Event) => {
                console.log(controller.bIsEditing);
                if(Event === "OK") {
                    columns.forEach((column) => {
                    const columnId = column.getId();
                    const columnProperty = column.getFilterProperty();
                        
                if(columnId === 'Wingspan'){
                    controller.Formatters.formatCellsOnSave(columnProperty, "mm", column, oDataModel)
                }
                else if(columnId === 'Weight'){
                    controller.Formatters.formatCellsOnSave(columnProperty, "g", column, oDataModel)
                }
                else if(columnId === 'Lifespan'){
                    controller.Formatters.formatCellsOnSave(columnProperty, "days", column, oDataModel)
                }
                else{
                column.setTemplate(
                    new sap.m.Text({
                    wrapping: false,
                    text: `{butterfliesModel>${columnProperty}}`
                    })
                );
                }
                });
                controller.saveButton.setVisible(false);
                controller.editButton.setVisible(true);
                controller.bIsEditing = false;
                }else{
                    console.log(controller.prevData);
                    const dataBeforeEdit = JSON.parse(JSON.stringify(controller.prevData))
                    oDataModel.setProperty('/butterflies', dataBeforeEdit);
                }
                sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        deleteRows: function(controller) {
            const table = controller.byId("butterfliesTable");
            const oDataModel = controller.getView().getModel('butterfliesModel');
            const butterfliesData = oDataModel.getProperty('/butterflies');
            const selectedIndex= table.getSelectedIndices(); //pobierz indexy
            const i18nModel = controller.getView().getModel("i18n");
            const noRowsSelected = i18nModel.getResourceBundle().getText("noRowsSelected");
            const oneRowQuestion = i18nModel.getResourceBundle().getText("oneRowQuestion");
            const severalRowsQuestion = i18nModel.getResourceBundle().getText("severalRowsQuestion");
            let text= '';
    
            if(selectedIndex.length ===1){ //w zależności od ilości zaznaczonych wierszy wybierz tekst dla MessageBox
                text = oneRowQuestion;
            }else{
                text = severalRowsQuestion;
            }
    
            if(selectedIndex.length <= 0){ //sprawdz czy wybrano jakiekolwiek wiersze
                MessageToast.show(noRowsSelected);
            }else{
            MessageBox.confirm(text,{
                onClose: (Event) => {
                if(Event === "OK"){
                    sap.ui.core.BusyIndicator.show(0);
                    for(let i=selectedIndex.length - 1; i >= 0; i--){ //iteruj od ostatniego indexu
                    butterfliesData.splice(selectedIndex[i], 1);
                    }
                    oDataModel.setProperty('/butterflies', butterfliesData); //ustaw nowe dane w modelu
                    sap.ui.core.BusyIndicator.hide();
                } 
                }
            });
            }
        },

        addRow: function(controller) {
            const oDataModel = controller.getView().getModel('butterfliesModel');
            const butterfliesData = oDataModel.getProperty('/butterflies');
            const i18nModel = controller.getView().getModel("i18n");
            const emptyRowAdded = i18nModel.getResourceBundle().getText("emptyRowAdded");
    
            butterfliesData.push({});
            oDataModel.setProperty('/butterflies', butterfliesData);
            MessageToast.show(emptyRowAdded+ " " + (butterfliesData.length - 1));
        },

        duplicateSelected: function(controller) {
            const table = controller.byId("butterfliesTable")
            const selectedIndex= table.getSelectedIndices();
            const oDataModel = controller.getView().getModel('butterfliesModel');
            const butterfliesData = oDataModel.getProperty('/butterflies');
            const i18nModel = controller.getView().getModel("i18n");
            const duplicateQuestion = i18nModel.getResourceBundle().getText("duplicateQuestion");
            const noRowsSelected = i18nModel.getResourceBundle().getText("noRowsSelected");
            const duplicateInfo = i18nModel.getResourceBundle().getText("duplicateInfo");
    
            let text = duplicateQuestion+" "+selectedIndex+"?";
            if(selectedIndex.length <= 0){
                MessageToast.show(noRowsSelected);
            }else{
                    MessageBox.confirm(text,{
                    onClose: (Event) => {
                        if(Event === "OK"){
                        sap.ui.core.BusyIndicator.show(0);
                        selectedIndex.forEach((index) => {
                            const path = table.getContextByIndex(index); //pobierz ścieżkę wiersza po indexie
                            const objectData = path.getObject(); //pobierz dane z wybranej ścieżki
                            const deepCopyData = JSON.parse(JSON.stringify(objectData)); //kopia danych niezależna od modelu
                            butterfliesData.push(deepCopyData);
                        },
                        sap.ui.core.BusyIndicator.hide(),
                        MessageToast.show(duplicateInfo+" "+ selectedIndex),
                        )
                        oDataModel.setProperty('/butterflies', butterfliesData);
                        }
                    }
            })}
        },

        freezeData: function(controller) {
            const view = controller.getView();
            const table = controller.byId("butterfliesTable");
    
            const columnsCount = view.byId("numberOfColumns").getValue() || 0;
            const rowsCount = view.byId("numberOfRows").getValue() || 0;
            const bottomRowsCount = view.byId("numberOfButtomRow").getValue() || 0;
    
            let parsedColumnsCount = parseInt(columnsCount);
            let parsedRowsCount = parseInt(rowsCount);
            let parsedBottomRowsCount = parseInt(bottomRowsCount);
            
            const rowsDisplayingMode = new sap.ui.table.rowmodes.Fixed({
              rowCount: table.getVisibleRowCount(), //visibleRowCount="10"(Table.view)
              fixedTopRowCount: parsedRowsCount, //block od góry
              fixedBottomRowCount: parsedBottomRowsCount //block od dołu
            });
            table.setRowMode(rowsDisplayingMode);
            table.setFixedColumnCount(parsedColumnsCount);
        },
          
        clearFilters: function(controller) {
            const table = controller.byId("butterfliesTable");
            const columns = table.getColumns();

            for (let i = 0; i < columns.length; i++) {
            table.filter(columns[i], null);
            }
        },
    }
});