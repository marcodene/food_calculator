const data = require('db.json');
console.log(data);


var template = document.querySelector("#template-esempio").innerHTML
const main = document.querySelector(".main")
console.log(main)

/*
var data = [{
    title: "Pasta",
    description: "Lorem ipsum non so come continua"},
    {
    title: "Pizza",
    description: "Lorem ipsum non so come continua"}]

*/


for (i = 0; i < data.length; i ++){
    var html = Mustache.render(template, data[i])

    main.insertAdjacentHTML("beforeend", html)
}

