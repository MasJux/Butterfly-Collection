sap.ui.define(
  [ 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/table/Column',  'sap/m/Label', 'sap/m/Text'],
  function (Controller, JSONModel, Column, Label, Text) {
    'use strict';

    return Controller.extend('snok.project.controller.Table', {
      onInit: function () {
        //załadoanie danych
        let oDataModel = new JSONModel();
        oDataModel.loadData(sap.ui.require.toUrl('snok/project/model/data.json'));
        this.getView().setModel(oDataModel, 'butterfliesModel');

        // wykonanie funkcji createTable po załadowaniu danych
        oDataModel.attachRequestCompleted(this.createTable.bind(this));
        
      },
      //utworzenie tabeli ładującej dane dynamicznie (nazwy kolumn i zawartość wierszy)
      createTable: function () {
        const dataTable = this.byId('butterfliesTable');
        const oDataModel = this.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');

        if (butterfliesData && butterfliesData.length > 0) {
          const firstRow = butterfliesData[0];
          const columnsNames = Object.keys(firstRow);

          //iteracyjne dodanie kolumn wraz z danymi do dataTable
          columnsNames.forEach((columnName) => {
            dataTable.addColumn(
              new Column({
                label: new Label({ text: columnName }), 
                template: new Text({ wrapping: false, text: `{butterfliesModel>${columnName}}` })
              })
            );
          });
          //powiązanie danych załadowanych do dataTable z modelem (butterfliesModel)
          dataTable.bindRows('butterfliesModel>/butterflies');
        }
      }
    });
  }
);