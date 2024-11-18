 sap.ui.define(
  [ 'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel', 
    'sap/ui/table/Column', 
    'sap/m/Label',
    'sap/m/Text',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
  	'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/table/RowAction',
    'sap/ui/table/RowActionItem',
    "sap/m/Dialog",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/m/Button"
],

  function (Controller, JSONModel, Column, Label, Text, Filter, FilterOperator, MessageBox, MessageToast, RowAction, RowActionItem, Dialog, ComboBox, Item, Button) {
    'use strict';

    return Controller.extend('snok.project.controller.Table', {
      onInit: function () {
        //załadoanie danych
        sap.ui.core.BusyIndicator.show(0);
        let oDataModel = new JSONModel();
        oDataModel.loadData(sap.ui.require.toUrl('snok/project/model/data.json'));
        this.getView().setModel(oDataModel, 'butterfliesModel');
        this.defaultData = JSON.parse(JSON.stringify(oDataModel.getData()));

        // wykonanie funkcji createTable po załadowaniu danych
        oDataModel.attachRequestCompleted(function() {
          sap.ui.core.BusyIndicator.hide();
          console.log("Załadowano model:", oDataModel);
          this.createTable();
        }.bind(this));

        this.editButton = this.byId("editButton");
        this.saveButton = this.byId("saveButton");
        
        //model ze stanami zmiany wartości pól w danych kolumnach
        const viewModel = new sap.ui.model.json.JSONModel({
          columnStates: {}
        });
        this.getView().setModel(viewModel, "viewModel");
      },

      //utworzenie tabeli ładującej dane dynamicznie (nazwy kolumn i zawartość wierszy)
      createTable: function () {
        const dataTable = this.byId('butterfliesTable');
        const oDataModel = this.getView().getModel('butterfliesModel');
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

      //formatowanie danych po zapisaniu
      formatCellsOnSave: function(columnProperty , unit, column) {
        const oDataModel = this.getView().getModel('butterfliesModel');
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
      formatCellsOnEdit: function(columnProperty , unit) {
        const oDataModel = this.getView().getModel('butterfliesModel');
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

      clearFilters: function() {
        const table = this.byId("butterfliesTable");
        const columns = table.getColumns();

        for (let i = 0; i < columns.length; i++) {
          table.filter(columns[i], null);
        }
      },

      freezeData: function() {
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
        const columns = table.getColumns();


        if(searchValue) {
          columns.forEach((column) => {
            new Filter(column.getId(), FilterOperator.Contains, searchValue);
          });
        }
        view.getModel('butterfliesModel').setProperty('/searchValue', searchValue);
      },

      /*metoda odpowiada za ustawienie wszystkich komórek na edytowalne,
      oprócz tego pełni funkcję walidacji ponieważ w komórkach numerycznych
      blokuje możliwość wpisania tekstu
      rozdziela także komórki które domyślnie mają format String np(Wingspan "22 mm") */
      editData: function() {
        const dataTable = this.byId('butterfliesTable');
        const columns = dataTable.getColumns();
        const oDataModel = this.getView().getModel('butterfliesModel');
        //zapis danych przed edycją
        this.prevData = JSON.parse(JSON.stringify(
          oDataModel.getProperty('/butterflies')
      ));
      
      if (!this.bIsEditing) {
        this.bIsEditing = true;
    
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
            inputTemplate = this.formatCellsOnEdit(columnProperty, "mm");
          }
          else if(columnId === 'Weight'){
            inputTemplate = this.formatCellsOnEdit(columnProperty, "g");
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
            inputTemplate = this.formatCellsOnEdit(columnProperty, "days");
          }
          else {
            inputTemplate = new sap.m.Input({
              value: `{butterfliesModel>${columnProperty}}`,
            });
          }

          column.setTemplate(inputTemplate);
        });
        sap.ui.core.BusyIndicator.hide();
        this.editButton.setVisible(false);
        this.saveButton.setVisible(true);
      }
    },

    /*metoda odpowiada za zapisanie danych po edycji lub
    przywrócenie poprzednich danych w przypadku anulowania edycji
    oprócz tego ustawia format danych które mają dwa typt np(Wingspan "22 mm") */
      saveData: function() {
        const dataTable = this.byId('butterfliesTable');
        const columns = dataTable.getColumns();
        const oDataModel = this.getView().getModel('butterfliesModel');
        console.log(this.prevDat);
        sap.ui.core.BusyIndicator.show(0);

      MessageBox.confirm("Zapisac dane?",{
        onClose: (Event) => {
          console.log(this.bIsEditing);
          if(Event === "OK") {
            columns.forEach((column) => {
              const columnId = column.getId();
              const columnProperty = column.getFilterProperty();
                
        if(columnId === 'Wingspan'){
          this.formatCellsOnSave(columnProperty, "mm", column)
        }
        else if(columnId === 'Weight'){
          this.formatCellsOnSave(columnProperty, "g", column)
        }
        else if(columnId === 'Lifespan'){
          this.formatCellsOnSave(columnProperty, "days", column)
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
        this.saveButton.setVisible(false);
        this.editButton.setVisible(true);
        this.bIsEditing = false;
          }else{
            console.log(this.prevData);
            const dataBeforeEdit = JSON.parse(JSON.stringify(this.prevData))
            oDataModel.setProperty('/butterflies', dataBeforeEdit);
          }
          sap.ui.core.BusyIndicator.hide();
        }
      });
    },

      //usuwanie wybranych wierszy
      deleteRows: function(evt) {
        const table = this.byId("butterfliesTable");
        const oDataModel = this.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');
        const selectedIndex= table.getSelectedIndices(); //pobierz indexy
        let text= '';

        if(selectedIndex.length ===1){ //w zależności od ilości zaznaczonych wierszy wybierz tekst dla MessageBox
          text = "Usunąć wiersz?";
        }else{
          text = "Usunąć wiersze?";
        }

        if(selectedIndex.length <= 0){ //sprawdz czy wybrano jakiekolwiek wiersze
          MessageToast.show("Nie wybrano żadnych wierszy");
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

      addRow: function() {
        const oDataModel = this.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');

        butterfliesData.push({});
        oDataModel.setProperty('/butterflies', butterfliesData);
        MessageToast.show("Dodano pusty wiersz o indexie:" + (butterfliesData.length - 1));
      },

      duplicateSelected: function() {
        const table = this.byId("butterfliesTable")
        const selectedIndex= table.getSelectedIndices();
        const oDataModel = this.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');
        let text = "Zduplikować wiersze o indexach: "+selectedIndex+"?";
        if(selectedIndex.length <= 0){
          MessageToast.show("Nie wybrano żadnych wierszy");
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
                    MessageToast.show("Zduplikowano wiersze o indexach "+ selectedIndex),
                  )
                    oDataModel.setProperty('/butterflies', butterfliesData);
                  }
                }
        })}
      },
      countValue: function(value, selectedColumn, unit){
        const newValue = value[selectedColumn].replace(/[^\d.-]/g, '') //usun text jezeli jest i zostaw sam number
        let changedValue = newValue * 3.3
        changedValue = changedValue.toFixed(2)
        const finalValue = changedValue.toString()+" "+unit
        return finalValue
      },

      changeDataValue: function() {
        const dataTable = this.byId('butterfliesTable');
        const columns = dataTable.getColumns();
        const oDataModel = this.getView().getModel('butterfliesModel');
        const butterfliesData = oDataModel.getProperty('/butterflies');
        const viewModel = this.getView().getModel("viewModel");
        const columnStates = viewModel.getProperty("/columnStates") || {};

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
        title: "Wybierz kolumnę do zmiany",
        content: [comboBox],
        beginButton: new Button({
          text: "Zapisz",
          press: () => {
            sap.ui.core.BusyIndicator.show(0);
              const selectedColumn = comboBox.getSelectedKey();
              console.log(options)
              
              butterfliesData.forEach((value, index) => { //sprawdz typ danych      
              if(dataType[selectedColumn] === "Number" ){

                //ustaw zmienione wartości i dopisz jednostkę, jeżeli posiada
                if(selectedColumn === "Wingspan"){
                  const finalValue = this.countValue(value, selectedColumn, "mm")
                  oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, finalValue);
                }else if(selectedColumn === "Weight"){
                  const finalValue = this.countValue(value, selectedColumn, "g")
                  oDataModel.setProperty(`/butterflies/${index}/${selectedColumn}`, finalValue);
                }else if(selectedColumn === "Lifespan"){
                  const finalValue = this.countValue(value, selectedColumn, "days")
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
        MessageToast.show("Zmieniono wartości w kolumnie: " + selectedColumn);
        sap.ui.core.BusyIndicator.hide();
      }
    }),
      endButton: new Button({
        text: "Anuluj",
        press: () => {
          changeDataDialog.close();
        }
      })
      }).open();
    },

      sumValues: function() {
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
          let sum;
          const dataTable = this.byId('butterfliesTable');
          const columns = dataTable.getColumns();
          const oDataModel = this.getView().getModel('butterfliesModel');
          const butterfliesData = oDataModel.getProperty('/butterflies');
          const options = columns.map((column) => {
            const columnProperty = column.getFilterProperty();
              return new Item({
                key: columnProperty,
                text: columnProperty,
              })
            })

            const result = new Text({
              text: "Suma: 0"
            });

            const comboBox = new ComboBox({
              items: options,
            })
    
            const countDataDialog = new Dialog({
              title: "Wybierz kolumnę do zsumowania",
              content: [
                comboBox,
                result
            ],  
              beginButton: new Button({
                text: "Oblicz sumę",
                press: () => {
                  sum=0;
  
                  const selectedColumn = comboBox.getSelectedKey();
                  butterfliesData.forEach((value) => { 
                    if(dataType[selectedColumn] === "Number" ){
                      sum += parseFloat(value[selectedColumn])
                    }else{
                      sum = "test"
                    }
                  })
                  if(dataType[selectedColumn] === "Number"){
                    result.setText("Suma: " + sum.toFixed(2));
                  }else{
                    result.setText("Suma: xxxx,xx");
                  }

                }
              }),
              endButton: new Button({
                text: "Anuluj",
                press: () => {
                  countDataDialog.close();
                }
              })
            }).open();
      }
    });
  });
//TODO:
//1. wyszukiwanie w całej tabeli