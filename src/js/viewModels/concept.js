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
        
        self.selectedItem = ko.observable("descriptions");
        
        const data = [
                  { name: "Otras Descripciones", id: "descriptions" },
                  { name: "Atributos", id: "Attributes"}
              ];              
              
        this.dataProvider = new ArrayDataProvider(data, { keyAttributes: "id" });       
        
        self.conceptModel = ko.computed(function () {
            
            //console.log(JSON.stringify(params));            
            if (typeof params.categoryModel() === 'undefined') {
                return;
            }                                                                                                           
            
            var categoryId = params.categoryModel().get('id');   
            var conceptModel = {};

            $.getJSON("http://dnssemantikos:8080/ws/rest/concepts/new/" + categoryId).
                then(function (concept) {                    
                    console.log(JSON.stringify(concept));
                    conceptModel = concept;                                                    
                    
                    self.fsnSensibility(concept.validDescriptionFSN.caseSensitive.toString());
                    self.fsnTerm(concept.validDescriptionFSN.term);   

                    self.favoriteSensibility(concept.validDescriptionFavorite.caseSensitive.toString());
                    self.favoriteTerm(concept.validDescriptionFavorite.term);  
                });                                           
                 
            return conceptModel;
        });
                
                            
    }
       
    return conceptContentViewModel;
});
