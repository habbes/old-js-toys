createObject = Object.create || function(proto){
	function ctor() { }
    ctor.prototype = proto;
    return new ctor();
};

function inherit(child, parent){
	child.prototype = createObject(parent.prototype);
	child.prototype.constructor = child;
}


var swal = swal || {};

//BASE CLASSES
//-- Object --
swal.Object = function(value){
	this.type = null;
	this.value = value;
	this.string = "Object";
}

//-- Instruction --
swal.Instruction = function(program){
	this.program = program;
}

swal.Instruction.prototype.execute = function(){}

//-- Program --
swal.Program = function(globals, locals){
	this.globals = globals,
	this.locals = locals,
	this.instructions = [];
	this.returnValue = null;
	this.isMain = false;
	this.return = false;
}

swal.Program.prototype.addInstruction = function(inst){
	this.instructions.push(inst);
}

swal.Program.prototype.execute = function(globals, locals){
	for(var i = 0; i < this.instructions.length; i++){
		this.instructions[i].execute();
		if(this.return){
			break;
		}
	}
}

/**
 * Base Expression Instruction (inherits Instruction)
 */
swal.Expression = function(program){
	swal.Instruction.call(this, program);
	this.returnValue = null;
}

swal.Expression.prototype = createObject(swal.Instruction.prototype);
swal.Expression.prototype.constructor = swal.Expression;

/**
 * Assignement Instruction (inherits Instruction)
 */
swal.Assignement = function(program, symbol, expression, global){
	//whether to make the assignment a global variable
	if(typeof(global) == "undefined")
		global = false;
	swal.Instruction.call(this, program);
	this.symbol = symbol;
	this.expression = expression;
	this.global = global;
}

swal.Assignement.prototype = createObject(swal.Instruction.prototype);
swal.Assignement.prototype.constructor = swal.Assignement;

swal.Assignement.prototype.execute = function(){
	this.expression.execute();
	var obj = this.expression.returnValue;
	if(!this.global)
		this.program.locals[this.symbol] = obj;
	else
		this.program.globals[this.symbol] = obj;
}

/**
 * If Statement inherits Instruction
 */
swal.IfStatement = function(program){
	swal.Instruction.call(this, program);
	this.ifCondition = null;
	this.elseCondition = null;
	this.ifBlock = null;
	this.elseBlock = null;
}

swal.IfStatement.prototype = createObject(swal.Instruction.prototype);
swal.IfStatement.prototype.constructor = swal.IfStatement;

swal.IfStatement.prototype.execute = function(){
	this.ifCondition.execute();
	if(this.ifCondition.returnValue.type != "boolean")
		throw "Type Error: if condition did not return boolean";
	if(this.ifCondition.returnValue == swal.true){
		this.ifBlock.program = this.program;
		this.ifBlock.execute();
	}
	else if(this.elseCondition != null){
		this.elseBlock.program = this.program;
		this.elseBlock.execute();
	}
}

/**
 * While Statement, inherits Instruction
 */
swal.WhileStatement = function(program){
	swal.Instruction.call(this, program);
	this.condition = null;
	this.block = null;
	this.break = false;
}

swal.WhileStatement.prototype = createObject(swal.Instruction.prototype);
swal.WhileStatement.prototype.constructor = swal.WhileStatement;

swal.WhileStatement.prototype.execute = function(){
	do{
		this.condition.execute();
		if(this.condition.returnValue.type != "boolean")
			throw "Type Error: while condition did not return boolean";
		if(this.condition.returnValue == swal.true){
			this.block.program = this.program;
			this.program.execute();
			if(this.break){
				break;
			}
			if(this.program.return){
				break;
			}
		}
	}while(this.condition.returnValue == swal.true);
}



//-- BASIC OBJECTS --

/**
 * Number Object inherits Object
 */
swal.Number = function(num){
	swal.Object.call(this, num);
	this.type = "number";
	this.string = num.toString();
}


swal.Number.prototype = createObject(swal.Object.prototype);
swal.Number.prototype.constructor = swal.Number;

/**
 *  Boolean Object inherits Object
 */
swal.Bool = function(val){
	swal.Object.call(this, val);
	this.type = "boolean";
	this.string = (val)? "true" : false;
}

swal.Bool.prototype = createObject(swal.Object.prototype);
swal.Bool.prototype.constructor = swal.Bool;

/**
 * True and False values
 */
swal.true = new swal.Bool(true);
swal.false = new swal.Bool(false);

//-- BASIC EXPRESSIONS --
/**
 * Number Expression inherits Expression
 */
swal.NumberExpression = function(program, num){
	swal.Expression.call(this, program);
	this.returnValue = new swal.Number(num);
}

swal.NumberExpression.prototype = createObject(swal.Expression.prototype);
swal.NumberExpression.prototype.constructor = swal.NumberExpression;

/**
 * Boolean expression, inherits Expression
 */
swal.BoolExpression = function(program, val){
	swal.Expression.call(this, program);
	this.returnValue = new swal.Number(num);
}

swal.BoolExpression.prototype = createObject(swal.Expression.prototype);
swal.BoolExpression.prototype.constructor = swal.BoolExpression;



