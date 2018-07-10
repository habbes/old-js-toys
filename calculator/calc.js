// Calculator
// By Habbes

window.onload = initAll;

//GLOBAL VARIABLES
var display; //the calc's display
var buffer;  //temporary storage for operands in pendind calculations
var currentOp; //the current operation being executed
var calcPending = false; /* holds the current state of the calculator, for example
whether it's awaiting a second operand or something*/
/*
state 0 : calcultor is reset, at "rest"
state 1 : operand is being fed into the calculator
state 2 : operator has been fed, waiting for 

*/

function initAll()
{
	display =new Display(document.getElementById("display"));
	
	var buttons = document.getElementsByTagName("BUTTON");
	
	for (var i=0;i<buttons.length;i++)
	{
		switch (buttons[i].className || buttons[i].id=="dec")
		{
			case "num":
				var nb = new NumButton(buttons[i],buttons[i].id);
			
				nb.element.onclick = numBtnClick;
				
				
				break;
			case "op":
				
				var operation;
				var btn;
				switch(buttons[i].id)
				{
					case "plus":
						operation = new Operation(function(op1,op2){
							op1++;op1--;
							op2++;op2--;
							var result = op1 + op2;
							return result;
							});
						break;
					case "minus":
						operation = new Operation(function(op1,op2){
							var result = op1 - op2;
							return result;
						});
						break;
					case "times":
						operation = new Operation(function(op1,op2){
							var result = op1 * op2;
							return result;
						});
						break;
					case "divide":
						
						operation = new Operation(function(op1,op2){
							var result = op1 / op2;
							return result;
						});
						break;
					default:
				}
				
				btn = new OperationButton(buttons[i],operation);
				btn.element.onclick = opBtnClick;
				break;
			default:
				switch(buttons[i].id)
				{
					case "reset":
						var clearBtn = new Button(buttons[i],"reset","CA");
						clearBtn.element.onclick = clearBtnClick;
						break;
					case "cancel":
						var delBtn = new Button(buttons[i],"cancel","DEL");
						delBtn.element.onclick = delBtnClick;
						break;
					case "eq":
						var eqBtn = new Button(buttons[i],'equals','EQUALS');
						eqBtn.element.onclick = eqBtnClick;
						
						break;
					case "dec":
						var decbtn = new Button(buttons[i],"dec",".");
						decbtn.element.onclick = numBtnClick;						
						break;
				}
		}
	}
		
}

function resetCalc()
{
	buffer = null; //reset buffer
	display.clear(); //clear the display
}

//EVENT HANDLERS

function numBtnClick() //handles number and decimal button click events
{	
	if (calcPending)
	{
		display.clear();
		calcPending = false;
	}
	display.write(this.control.value);
}

function clearBtnClick()
{
	resetCalc();
}

function delBtnClick()
{
	display.deleteChar();
}

function opBtnClick()
{
	
	
	if (buffer)
	{
		var op1,op2,op,result;
		op1 = buffer;
		op2 = display.getValue();
		op = currentOp;
		result = op.operate(parseFloat(op1),parseFloat(op2));
		display.set(result);
	}
	buffer = display.getValue();
	currentOp = this.control.operation;
	calcPending = true;
	
		
}

function eqBtnClick()
{
	
	var result;
	if (!buffer)
	{
		result = display.getValue;
		return;
	}
	else
	{
		var op1,op2;
		op1 = buffer;
		op2 = display.getValue();
		result = currentOp.operate(op1,op2);
	}
	display.set(result);
	buffer = null;
	calcPending = true;
}

//PROTOTYPE DEFINITIONS

/* --TODO-- I question the need for the 'type' property in the following
Button and NumButton prototype, delete them if they prove to be obsolete*/
function Button(element,type,value)
{
	this.element = element;
	this.element.control = this;
	this.type=type;
	this.value = value;
	
}

function NumButton(element,value)
{
	this.element = element;
	this.element.control = this;
	this.value = value;
	this.type="num";

}

function OperationButton(element,operation)
{
	this.element = element;
	this.element.control = this;
	this.operation = operation;
}

/*this represents the operations that the calcultor will execute, 
each Operation is initiated with an operate(operand1,operand2) which
will execute the operation and return the resutl */
function Operation(operate)
{
	this.operate = operate;
}


function Display(element)
{
	this.element = element;
	this.element.control = this;
	this.content = content;
	this.cleared = true;
	this.isDecimal = false;
	this.write = write;
	this.clear = clear;
	this.set = set;
	this.checkDecimal = checkDecimal;
	this.formatInput = formatInput;
	this.getValueOf = getValueOf;
	this.getValue = getValue;
	this.deleteChar = deleteChar;
	
	this.clear()//clear the display when created
	
	function content()
	{
		return this.element.innerHTML;
	}
	
	//writes a single digit on the display
	function write(content)
	{
		
		//for the following three if-blocks, try to enhance the code
		// by throwing errors instead of return false;
		if (content.length != 1)
		{
			return false; //make sure the content one character long
			
		}
		
		if (isNaN(content) && (content!="."))
		{
			
			return false; //make sure it's either a digit or decimal point
		}
		
		
		if (this.isDecimal && content==".")
		{
			return false; //only allow one decimal point	
		}
		
		

		var txt="";
		
		if (this.content() != "0" || content==".")
		{
			/*this prevents from having the display write a non-decimal
			number that starts with 0 */
			
			txt = this.getValue();
			
			/* this.getValue() returns the float value of the current
			display content, if the content is 45,904 it will return
			45904 If it is 784. it will return 784
			Since write takes in one digit and since it it appends this
			digit to the value of this.getValue, when one adds input to 5
			the content 58. instead of the desired 58.5, the content will be
			585, the following if block fixes this problem */
			
			if (this.isDecimal && String(txt).indexOf(".") < 0)
			{
				txt = String(txt) + ".";
			}
			
		}
		txt = String(txt) + String(content);
		
		//check for overflow
		if (String(parseFloat(txt)).indexOf("Infinity") > -1)
		{
			alert("Overflow error!")
			return false;
		}
		
		this.element.innerHTML = this.formatInput(txt);
		this.cleared = false;
		this.checkDecimal();
		
	}
	
	function set(content)
	{
		
		if (parseFloat(content) || parseFloat(content) ==0)
		{
			
			this.element.innerHTML = this.formatInput(content);
			this.checkDecimal();
			
			if (this.content() == 0)
			{
				this.cleared = true;
			}
			return;
		}
		return false;
	}
	
	//might not work with exponential notation
	function deleteChar()
	{
		var val = this.content().slice(0,this.content().length - 1);
		
		val = this.getValueOf(val);
		this.element.innerHTML = this.formatInput(val);
		this.checkDecimal();
		
		if (!parseFloat(this.getValue()))
		{			
			
			this.clear();
		}
	}
	
	function clear()
	{
		this.element.innerHTML = 0;
		this.cleared = true;
		this.checkDecimal();
		
	}
	
	/* checks whether the display content is a decimal number
	(whether it contains ".", and sets the isDecimal property accordingly*/
	
	function checkDecimal()
	{
		this.isDecimal = false;
		
		if (this.content().indexOf(".")>-1)
		{
			this.isDecimal = true;
		}
		
	}
	
	//function to format input into a comma-grouped number format
	
	function formatInput(input)
	{
		
		var whole = String(input).split(".")[0];
		whole = whole.split("").reverse().join("") /*reverse whole so we can count
		three digit groups from last digit */
		var output="";
		var counter = 0;
		for (var i=0; i<whole.length;i++)
		{
			output += whole.charAt(i);
			counter++;
			if (counter == 3 && i != whole.length-1)
			{
				output += ",";
				counter = 0;
			}
			
		}
		output = output.split("").reverse().join("") //restore digit order
		
		if (String(input).indexOf(".") > -1)
		{
			
			output += "." + String(input).split(".")[1];
		}
		
		return output;
	}
	
	function getValueOf(input)//gets the number/float value of a string input
	{
		var output=0;
		var str=input.split(",").join("");
		if (!isNaN(str))//check if str is convertible to a float before returning it
		{
			/* returns str only when it's convertible to a float,meaning its a valid number.
			It does not however convert it to a float since this will result for example
			in the str 74.300000 to be converted to 74.3, which prevents the user from
			inputting 0'a after the decimal point */
			output = str;
			return output;
		}
	}
		
	function getValue() //gets the number/float value of the content
	{
		return this.getValueOf(this.content());
	}	
}


