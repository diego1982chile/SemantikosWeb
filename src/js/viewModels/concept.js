/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['ojs/ojcore','knockout',
        'ojs/ojresponsiveutils', 
        'ojs/ojresponsiveknockoututils',
        'ojs/ojarraydataprovider',
        "ojs/ojradioset",
        "ojs/ojswitcher",
        'ojs/ojcollapsible',
        'ojs/ojconverter-number','ojs/ojchart','ojs/ojformlayout'], 
function (oj, ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, NumberConverter) {
    /**
     * The view model for the main content view template
     */        
    function conceptContentViewModel(params) {
        
        var self = this;        
        
        self.name = ko.observable();
        
        /* Variables */
        self.id = ko.observable(1);
        
        self.fsnSensibility = ko.observable(false);
        self.fsnTerm = ko.observable("");   
        
        self.favoriteSensibility = ko.observable(false);
        self.favoriteTerm = ko.observable("");
        
        self.selectedItem = ko.observable("descriptions-tab");             
              
        self.dataProvider = ko.observableArray();
        
        self.conceptModel = ko.observable();
        
        self.tabs = ko.observableArray();               
        
        self.relationshipDefinitionsModel = ko.observableArray();
        
        self.conceptModel1 = ko.computed(function () {
            
            //console.log(JSON.stringify(params));            
            if (typeof params.categoryModel() === 'undefined') {
                return;
            }                                                                                                           
            
            var categoryId = params.categoryModel().get('id');               

            $.getJSON("http://dnssemantikos:8080/ws/rest/concepts/new/" + categoryId).
                then(function (concept) {                    
                    console.log(JSON.stringify(concept.validDescriptionsButFSNandFavorite));
                    self.conceptModel(concept);  
                    
                    console.log(self.conceptModel());
                    
                    self.fsnSensibility(concept.validDescriptionFSN.caseSensitive.toString());
                    self.fsnTerm(concept.validDescriptionFSN.term);   

                    self.favoriteSensibility(concept.validDescriptionFavorite.caseSensitive.toString());
                    self.favoriteTerm(concept.validDescriptionFavorite.term);  
                });   
                
            $.getJSON("http://dnssemantikos:8080/ws/rest/relationshipDefinitions/smtk/" + categoryId).
                then(function (relationshipDefinitions) {                                        
                    self.relationshipDefinitionsModel(relationshipDefinitions);                     
                    
                    console.log(self.relationshipDefinitionsModel());                                        
                    
                    if(relationshipDefinitions.length !== 0) {
                        self.tabs([
                            { name: "Otras Descripciones", id: "descriptions-tab" },
                            { name: "Atributos", id: "attributes-tab"}
                        ]);                                                    
                    }
                    else {                                
                        self.tabs([{ name: "Otras Descripciones", id: "descriptions-tab" }]);                         
                    }
                    
            });                          
                
            return params;
        });
        
         self.dataProvider = new ArrayDataProvider(self.tabs, { keyAttributes: "id" });
                
                            
    }
       
    return conceptContentViewModel;
});
