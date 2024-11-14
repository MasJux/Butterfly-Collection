sap.ui.define(
  [ 'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel', 
    'sap/ui/table/Column', 
    'sap/m/Label',
    'sap/m/Text',
    'sap/m/Input',
    'sap/ui/table/rowmodes/Fixed',
    'sap/ui/table/RowAction',
    'sap/ui/table/RowActionItem',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/ColumnListItem',],
  function (Controller, JSONModel, Column, Label, Text, FixedRowMode, RowAction, RowActionItem, Filter, FilterOperator, Input, ColumnListItem) {
    'use strict';

    return Controller.extend('snok.project.controller.Table', {
      onInit: function () {
        //załadoanie danych
        let oDataModel = new JSONModel();
        oDataModel.loadData(sap.ui.require.toUrl('snok/project/model/data.json'));
        this.getView().setModel(oDataModel, 'butterfliesModel');
        this.defaultData = JSON.parse(JSON.stringify(oDataModel.getData()));

        // wykonanie funkcji createTable po załadowaniu danych
        oDataModel.attachRequestCompleted(function() {
          console.log("Załadowano model:", oDataModel);
          this.createTable();
        }.bind(this));

      },
      rebindTable: function (customTableTemplate) {
        const dataTable = this.byId('butterfliesTable');
        dataTable.bindRows({
          path: "butterfliesModel>/butterflies",
          template: customTableTemplate
        });
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

      clearFilters: function(oEvent) {
        const table = this.byId("butterfliesTable");
        const columns = table.getColumns();

        for (let i = 0; i < columns.length; i++) {
          table.filter(columns[i], null);
        }
      },

      freezeData: function(oEvent) {
        const view = this.getView();
        const table = this.byId("butterfliesTable");

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

      searchContent: function (oEvent) {
        const view = this.getView();
        const table = this.byId("butterfliesTable");
        const searchValue = oEvent.getParameter("newValue");
        const oBinding = table.getBinding("rows");
        const columns = table.getColumns();


        if(searchValue) {
          columns.forEach((column) => {
            new Filter(column.getId(), FilterOperator.Contains, searchValue);
          });
        }
        view.getModel('butterfliesModel').setProperty('/searchValue', searchValue);
      },

    //   editData: function(oEvent) {
    //     const dataTable = this.byId('butterfliesTable');
    //     const columns = dataTable.getColumns();
    //     const oDataModel = this.getView().getModel('butterfliesModel');

    //     this.prevData = JSON.parse(JSON.stringify(
    //       oDataModel.getProperty('/butterflies')
    //   ));

          
    //   if (!this.bIsEditing) {
    //     this.bIsEditing = true;
    
    //     // Iteracja przez wszystkie kolumny i zmiana szablonu na Input
    //     columns.forEach((column) => {
    //       const columnId = column.getId();
    //       const columnProperty = column.getFilterProperty();
    
    //       // Ustawienie nowego szablonu z Input zamiast Text
    //       column.setTemplate(
    //         new sap.m.Input({
    //           value: `{butterfliesModel>${columnProperty}}`
    //         })
    //       );
    //     });
    
    //     // Odswieżenie tabeli, aby pokazać Inputy
    //     dataTable.getBinding("rows").refresh();
    //   }
    // }
  });
});
