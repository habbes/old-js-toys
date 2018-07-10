var swal = swal || {};

swal.tokenType = {ID:"identifer", RESERVED:"reserved", NUMBER:"number", NONE:"none"};

swal.TokenExpr = function (re, type, name){
	this.re = re;
	this.name = name;
	this.type = type;
}

swal.Token = function(val, expr){
	this.value = val;
	this.expr = expr;
}

swal.tokenExprs = [
	new swal.TokenExpr(/[ \t]+/, swal.tokenType.NONE, 'whitespace'),
	new swal.TokenExpr(/\n+/, swal.tokenType.RESERVED, 'endline'),
	new swal.TokenExpr(/\+/, swal.tokenType.RESERVED, 'plus'),
	new swal.TokenExpr(/:=/, swal.tokenType.RESERVED, 'assign'),
	new swal.TokenExpr(/=/, swal.tokenType.RESERVED, 'equals'),
	new swal.TokenExpr(/[\+\-]?\d+(\.d+)?/, swal.tokenType.NUMBER, 'number'),
	new swal.TokenExpr(/[A-Za-z][A-Za-z_0-9]*/, swal.tokenType.ID, 'id'),

];

swal.lexer = function(exprs, source){
	var tokens = [];
	var re;
	while(source.length > 0){
		var found = false;
		for(var i = 0; i < exprs.length; i++){
			re = exprs[i].re;
			var res = re.exec(source);
			if(res != null && res.index == 0){
				found = true;
				console.log("found", res[0], exprs[i].name);
				source = source.slice(res[0].length);//remove matched token
				console.log("sliced", source);
				if(exprs[i].type != swal.tokenType.NONE)
					tokens.push(new swal.Token(res[0], exprs[i]));
				break;
			}
		}
		if(!found)
			throw "Parse error at " + source[0];
	}

	return tokens;
}

swal.ParserResult = function(res, nextPos){
	this.pos = nextPos;
	this.result = res;
}

swal.fakeParse = function(tokenList){
	var program = new swal.Program({}, {});
	program.isMain = true;
	var token;
	var instr;
	var pos = 0;
	while(pos < tokenList.length){
		var id = tokenList[pos++].value;
		pos++;
		var num = Number(tokenList[pos++].value);
		pos++;
		program.addInstruction(new swal.Assignement(program,id, new swal.NumberExpression(program, num)));
	}
	return program;
}