/**
 * Clément "Habbes" Habinshuti
 * 15.07.2014
 * TabViewer
 */

/**
 * manages a list of tabs
 */
function TabViewer(){
	this._tabs = Array();
	this._selectedTab = null;
	this._selectedIndex = 0;

	this._selectTab = function(tab){
		if(this._selectedTab){
			this._selectedTab.hide();
			this._selectedTab.dispatchUnselectEvent();
		}
		for(var i = 0; i < this._tabs.length; i++){
			if(this._tabs[i] == tab){
				this._selectedIndex = i;
				break;
			}
		}
		this._selectedTab = tab;
		tab.show();
		this._selectedTab.dispatchSelectEvent();
	};

	//number of tabs
	this.count = function(){
		return this._tabs.length;
	};

	//currently selected tab
	this.getSelectedTab = function(){
		return this._selectedTab;
	};

	//index of currently selected tab
	this.getSelectedIndex = function(){
		return this._selectedIndex;
	};

	//add tab to the viewer
	this.addTab = function(tab){
		tab.hide();
		tab.index = this._tabs.length;
		tab._viewer = this;
		this._tabs.push(tab);
		tab.getButton().addEventListener("click", function(e){e.currentTarget._tab._viewer.selectTab(e.currentTarget._tab)}, false);
	};

	//get tab at specified index
	this.tabAt = function(index){
		return this._tabs[index];
	};

	//select tab at specified index
	this.selectIndex = function(index){
		var count = this.count();
		if(index < 0){
			index = this.count() + index;
		}
		if(index >= count || index < 0){
			throw "Index out of range";
		}
		if(this._selectedTab){
			this._selectedTab.hide();
		}
		this._selectTab(this._tabs[index]);
	};

	//select specified tab
	this.selectTab = function(tab){
		this._selectTab(tab);
	}

	//replace implementation of show() method of all tabs with custom function
	this.overrideShow = function(func){
		for(var i = 0; i < this._tabs.length; i++){
			this._tabs[i].overrideShow(func);
		}
	}

	//replace implementation of hide() method of all tabs with custom function
	this.overrideHide = function(func){
		for(var i = 0; i < this._tabs.length; i++){
			this._tabs[i].overrideHide(func);
		}
	}
}

/**
 * represents a tab page and its button
 * @param button the html element to use as the tab button
 * @param content the html element to use as the tab page/content
 */
function Tab(button, content){
	//the tab button and tab page
	this._button = button;
	this._button._tab = this;
	this._content = content;
	this._content._tab = this;

	//custome select/unselect events
	this._onSelect = new CustomEvent('select', {'detail':{'tab':this},'bubbles':true});
	this._onUnselect = new CustomEvent('unselect', {'detail':{'tab':this},'bubbles':true});

	//default implementation of the show and hide methods
	this._defaultShow = function(){
		this._content.style.display = "block";
	};

	this._defaultHide = function(){
		this._content.style.display = "none";
	};

	/*
	show/display the tab content (when selected)
	behaviour can be changed through overrideShow method
	*/
	this.show = this._defaultShow;

	/*
	hide tab content (when deselected)
	behaviour can be changed through overrideHide method
	*/
	this.hide = this._defaultHide;

	//get button of the tab
	this.getButton = function(){
		return this._button;
	};

	//get content page of the tab
	this.getContent = function(){
		return this._content;
	};

	//alias just for convenience
	this.getPage = this.getContent;

	//override hide and show methods with custom implementations
	this.overrideShow = function(func){
		this.show = func;
	};

	this.overrideHide = function(func){
		this.hide = func;
	};
	
	//add handler for select event
	this.addSelectEventListener = function(callback){
		this._content.addEventListener('select', callback, false);
	};

	//trigger select event
	this.dispatchSelectEvent = function(){
		this._content.dispatchEvent(this._onSelect);
	};

	//add handler for unselect event
	this.addUnselectEventListener = function(callback){
		this._content.addEventListener('unselect',callback, false);
	};

	//trigger unselect event
	this.dispatchUnselectEvent = function(){
		this._content.dispatchEvent(this._onUnselect);
	};
}
