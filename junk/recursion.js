

var mega = {}
mega.children = [];
mega.children[0] = {};
mega.children[0].children = [];
mega.children[0].children[0] = {};
mega.children[0].children[0].children = [];
mega.children[0].children[1] = {};
mega.children[0].children[1].children = [];

mega.children[1] = {};
mega.children[1].children = [];
mega.children[1].children[0] = {};
mega.children[1].children[0].children = [];
mega.children[1].children[1] = {};
mega.children[1].children[1].children = [];

mega.children[2] = {};
mega.children[2].children = [];
mega.children[2].children[0] = {};
mega.children[2].children[0].children = [];
mega.children[2].children[1] = {}
mega.children[2].children[1].children = [];


function getPriority(node, array){
	var len = node.children.length;
	for(var i = 0; i < len; i++){
		array.push(i);
		console.log(i);
		getPriority(node.children[i], array);
	}
	return array;
}

var array = getPriority(mega, [])
console.log(array);


async function getDepth(node, d){
	if (node.parent != null){
		d++;
		return await getDepth(node.parent, d);
	}
	else {
		return d;
	}
}

//getDepth(mega, 0).then( (d) => {console.log(d)})