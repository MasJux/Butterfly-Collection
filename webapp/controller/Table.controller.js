 sap.ui.define(
  [ 'sap/ui/core/mvc/Controller',
    '../model/TableModel',
    '../utils/TableManagement',
    '../utils/Formatters',
    '../utils/DataService'
],

  function (Controller,TableModel, TableManagement, Formatters, DataService) {
    'use strict';

    return Controller.extend('snok.project.controller.Table', {
      onInit() {
        this.TableModel = new TableModel(this);
        this.TableManagement = TableManagement;
        this.Formatters = Formatters;
        this.DataService = DataService;
        this.createModels();
        this.editButton = this.byId("editButton");
        this.saveButton = this.byId("saveButton");
      },

      //tworzenie modelu tłumaczeń i18n i modelu z danymi
      createModels() {
        const i18nModel = this.TableModel.createI18nModel();
        this.getView().setModel(i18nModel, "i18n");

        this.TableModel.createDataModel();
      },

      //comboBox do zmiany języka
      changeLanguage(oEvent) {
        this.TableModel.changeLanguage(oEvent);
      },

      //utworzenie tabeli ładującej dane dynamicznie (nazwy kolumn i zawartość wierszy)
      createTable() {
        TableManagement.createTable(this);
      },

      //edycja danych z walidacją
      editData() {
        TableManagement.editData(this);
      },

      //zapis danych po edytowaniu
      saveData() {
        TableManagement.saveData(this);
      },

      //usunięcie wybranych wierszy
      deleteRows() {
        TableManagement.deleteRows(this);
      },

      //dodanie nowego pustego wiersz
      addRow() {
        TableManagement.addRow(this);
      },

      //duplikowanie wybranych wierszy
      duplicateSelected() {
        TableManagement.duplicateSelected(this);
      },

      //custom zmiana wartości (number*3.3 || String +"ed")
      changeDataValue() {
        DataService.changeDataValue(this);
      },

      //suma wartości numerycznych lub xxx,xx przy stringu
      sumValues() {
        DataService.sumValues(this);
      },
      
      //mrożenie kolumn || wierszy
      freezeData() {
        TableManagement.freezeData(this);
      },

      //czyszczenie filtrów
      clearFilters() {
        TableManagement.clearFilters(this);
      }
    });
  });