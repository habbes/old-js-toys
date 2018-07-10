
function SimpleDatePicker(element){
	this.element = element;
	this.element.picker = this;
	this.year = 0;
	this.month = 0;
	this.day = 0;
	this.hour = 0;
	this.minute = 0;
	this.second = 0;

	this.start = new Date();
	this.end = new Date();
	this.end.setFullYear(this.end.getFullYear() + 1);

	
	var arr = ["year", "month", "day", "hour", "minute", "second"];
	var monthDays = {0:31, 1:29, 2:31 , 3:30, 4:31, 5:30, 6:31, 7:31, 8:30, 9:31, 10:30, 11:31};
	var months = ["January","February","March","April","May","June",
					"July","August","September","October","November","December"];
	this.monthNames = {};
	for(var i = 0; i < months.length; i++){
		this.monthNames[i] = months[i];
	}

	for(var i = 0; i < arr.length; i++){
		eval("this." + arr[i] + "Text = '" + arr[i] + "'");
		eval("this." + arr[i] + "Field = element.getElementsByClassName('" + arr[i] + "')[0]");
	}

	this.getOption = function(text, value, selected){
		if(undefined == selected) selected = false;
		var el = document.createElement("OPTION");
		el.textContent = text;
		el.value = value;
		return el;
	}

	this.setFieldText = function(){
		for(var i = 0; i < arr.length; i++){
			var el = document.createElement("OPTION");
			el.textContent = this[arr[i] + "Text"];
			el.value = "";
			var f = this[arr[i] + "Field"];
			if(f != undefined){
				f.add(el);
			}
		}
	}

	this.loadDates = function(){
		var sy = this.start.getFullYear();
		var ey = this.end.getFullYear();
		if(this.yearField){
			for(var y = sy; y <= ey; y++){
				this.yearField.add(this.getOption(y, y));
			}
		}
		if(this.monthField){
			for(var m = 0; m < 12; m++){
				this.monthField.add(this.getOption(this.monthNames[m], m));
			}
		}
		if(this.dayField){
			for(var d = 0; d < 31; d++){
				this.dayField.add(this.getOption(d + 1, d));
			}
		}
		if(this.hourField){
			for(var h = 0; h < 24; h++){
				this.hourField.add(this.getOption(h, h));
			}
		}

	}

	this.load = function(){
		this.setFieldText();
		this.loadDates();

	}

	this.getSelectedDate = function(){

	}
}