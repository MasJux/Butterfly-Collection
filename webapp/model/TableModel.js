sap.ui.define(
[
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/resource/ResourceModel'
], 

function(JSONModel, ResourceModel) {
    'use strict';
    
    return function(controller) {
        return{
            createI18nModel: function() {
                return new ResourceModel({
                    bundleName: "snok.project.i18n.i18n"
                });
            },

            createDataModel: function() {
                sap.ui.core.BusyIndicator.show(0);
                let oDataModel = new JSONModel();
                oDataModel.loadData(sap.ui.require.toUrl('snok/project/model/data.json'));
                controller.getView().setModel(oDataModel, 'butterfliesModel');
                controller.defaultData = JSON.parse(JSON.stringify(oDataModel.getData()));

                // wykonanie funkcji createTable po załadowaniu danych
                oDataModel.attachRequestCompleted(function() {
                sap.ui.core.BusyIndicator.hide();
                controller.createTable();
                }.bind(controller));

                const viewModel = new sap.ui.model.json.JSONModel({
                    columnStates: {}
                  });
                  controller.getView().setModel(viewModel, "viewModel");
            },

            changeLanguage: function(oEvent) {
                const language = oEvent.getSource().getSelectedItem().getKey();  
                sap.ui.getCore().getConfiguration().setLanguage(language);
                var oResourceModel = new ResourceModel({
                  bundleName: "snok.project.i18n.i18n"
                });
          
                // aktualizacja modelu i18n
                controller.getView().setModel(oResourceModel, "i18n");
            }
        }
    };
});