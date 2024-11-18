sap.ui.define([], 

function() {
    'use strict';
    
    return {
        //formatowanie po zapisie do poprzedniego stanu(nadanie jednostek)
        formatCellsOnSave: function( columnProperty , unit, column, oDataModel) {
            const butterfliesData = oDataModel.getProperty('/butterflies');
            //sprawdzenie czy dane posiadają jednostkę(mm, g, days)
            butterfliesData.forEach((item, index) => {
                let value = item[columnProperty];
                if(value && !value.includes(unit)){
                value += ' ' + unit;
                }
                //ustawienie zedytowanej wartości w modelu
                oDataModel.setProperty(`/butterflies/${index}/${columnProperty}`, value);
                //powrót do początkowego formatu danych(input+text -> text)
                column.setTemplate(
                new sap.m.Text({
                    wrapping: false,
                    text: `{butterfliesModel>${columnProperty}}`
                })
                );
            });
            },
        
        //formatowanie potrzebne do edycji danych
        formatCellsOnEdit: function( columnProperty , unit, oDataModel) {
            //tworzenie boxa z inputem i textem 
            return new sap.m.HBox({
                alignItems: "Center",
                items: [
                new sap.m.Input({
                    value: {
                        path: `butterfliesModel>${columnProperty}`,
                        mode: "TwoWay",
                        formatter: function(value) {
                            return value ? value.replace(/[^\d.-]/g, '') : '';
                        }
                    },
                    type: "Number",
                    liveChange: function(oEvent) {
                    const newValue = oEvent.getParameter("newValue"); //pobierz nową wartość
                    const bindingContext = oEvent.getSource().getBindingContext('butterfliesModel'); //sprawdź w której komórce sie znajdujesz
                    const propertyPath = bindingContext.getPath() + `/${columnProperty}`; //zapisz ścieżkę edytowanej komórki
                    oDataModel.setProperty(propertyPath, newValue); //wartość komórki w modelu po edycji
                    }
                }), 
                    new sap.m.Text({ //dodanie jednostki jako Text (widok)
                        text: unit, 
                        wrapping: false
                    })
                ]
            });
        },

        countValue: function(value, selectedColumn, unit){
            const newValue = value[selectedColumn].replace(/[^\d.-]/g, '') //usun text jezeli jest i zostaw sam number
            let changedValue = newValue * 3.3
            changedValue = changedValue.toFixed(2)
            const finalValue = changedValue.toString()+" "+unit
            return finalValue
      },
    }
});