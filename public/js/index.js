var template = document.querySelector("#template-esempio").innerHTML

var data = [{
    title: "pasta",
    description: "buona"},

    {
    title: "pizza",
    description: "no buona"}]



const main = document.querySelector(".main")

for (i = 0; i < data.length; i ++){
    main.append(Mustache.render(template, data[0]))
}

