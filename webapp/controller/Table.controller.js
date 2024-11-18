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
    'sap/m/Dialog',
    'sap/m/ComboBox',
    'sap/ui/core/Item',
    'sap/m/Button',
    'sap/ui/model/resource/ResourceModel',
    '../model/TableModel',
    '../utils/TableManagement',
    '../utils/Formatters',
    '../utils/DataService'
],

  function (Controller, JSONModel, Column, Label, Text, Filter, FilterOperator, MessageBox, MessageToast, Dialog, ComboBox, Item, Button, ResourceModel, TableModel, TableManagement, Formatters, DataService) {
    'use strict';

    return Controller.extend('snok.project.controller.Table', {
      onInit: function () {
        this.TableModel = new TableModel(this);
        this.TableManagement = TableManagement;
        this.Formatters = Formatters;
        this.DataService = DataService;
        this.createModels();
        this.editButton = this.byId("editButton");
        this.saveButton = this.byId("saveButton");
      },

      //tworzenie modelu tłumaczeń i18n i modelu z danymi
      createModels: function() {
        const i18nModel = this.TableModel.createI18nModel();
        this.getView().setModel(i18nModel, "i18n");

        this.TableModel.createDataModel();
      },

      //comboBox do zmiany języka
      changeLanguage: function(oEvent) {
        this.TableModel.changeLanguage(oEvent);
      },

      //utworzenie tabeli ładującej dane dynamicznie (nazwy kolumn i zawartość wierszy)
      createTable: function() {
        TableManagement.createTable(this);
      },

      //edycja danych z walidacją
      editData: function() {
        TableManagement.editData(this);
      },

      //zapis danych po edytowaniu
      saveData: function() {
        TableManagement.saveData(this);
      },

      //usunięcie wybranych wierszy
      deleteRows: function() {
        TableManagement.deleteRows(this);
      },

      //dodanie nowego pustego wiersz
      addRow: function() {
        TableManagement.addRow(this);
      },

      //duplikowanie wybranych wierszy
      duplicateSelected: function() {
        TableManagement.duplicateSelected(this);
      },

      //custom zmiana wartości (number*3.3 || String +"ed")
      changeDataValue: function() {
        DataService.changeDataValue(this);
      },

      //suma wartości numerycznych lub xxx,xx przy stringu
      sumValues: function() {
        DataService.sumValues(this);
      },
      
      //mrożenie kolumn || wierszy
      freezeData: function() {
        TableManagement.freezeData(this);
      },

      //czyszczenie filtrów
      clearFilters: function() {
        TableManagement.clearFilters(this);
      }
    });
  });