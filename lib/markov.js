/*=========================================================================================
This module creates a small Markov chain from the passed yaml file.
The Yamle file should represent the chain as a square matrix, where the 
number of rows/columns must equal the number of states.  Values of probability 
are between 0 and 1
=========================================================================================== */

// TODO:
/*
	change the loading of the states from hard code to yaml loader 
*/

var _ = require('underscore');

//states class
function State(name, basePrice, unit, states) {
	this.name = name;
	this.basePrice = basePrice;
	this.unit = unit;
	this.states = states;
	this.currentState;

	this.getNextState = function(){
		return "just called getNextState of " + this.name;
	};

	this.getNewPrice = function(){
		var iMax = currentState.length
		   ,jMax = states.length
		   ,newState = []
		   ,newPrice
		   ,maxProb;

		for(var i = 0; i < iMax; i++)
		{
			var sum = 0;
			maxProb = 0;
			for(var j = 0; j < jMax; j++)
			{
				sum += currentState[i] * states[i][j];
				if(sum > maxProb)
					maxP = sum;
			}

			newState[i] = sum;
		}

		//set the new state
		currentState = newState;

		//in the states, the order is [+, =, -]
		for(var i = 0; i <  currentState.length; i++)
		{
			if(currentState[i] == maxProb)
			{
				switch(i)
				{
					case 0:
						this.basePrice += basePrice * Math.random() * (0.15-0.1) + 0.1;
						break;
					case 2:
						this.basePrice -= basePrice * Math.random() * (0.15-0.1) + 0.1;
						if(this.basePrice<0)
							this.basePrice =0;
						break;
				}
			}
		}

		return this.basePrice;
	};
}


function createCommodity(name, basePrice, unit, states) {
	currentState = [0,1,0];
	return new State(name,basePrice,unit,states);
}


//Exports ========================================================
//========================

module.exports.createCommodity = createCommodity;