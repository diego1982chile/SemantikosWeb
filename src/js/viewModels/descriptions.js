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
    function descriptionsContentViewModel(params) {
        
        var self = this;        
       
        
        self.name = ko.observable();
        
        /* Variables */
        self.id = ko.observable(1);
        
        self.fsnSensibility = ko.observable(false);
        self.fsnTerm = ko.observable("");   
        
        self.favoriteSensibility = ko.observable(false);
        self.favoriteTerm = ko.observable("");
        
        self.selectedItem = ko.observable("other-descriptions");                        
                            
    }
       
    return descriptionsContentViewModel;
});
