/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function BadButton()
{
    console.log("Bad Button Made");
    this.init()
}

BadButton.prototype.init = function (){

var BadBB = document.getElementById("bad-button");
    
function flashRed()
{
    document.body.style.backgroundColor = "red";
    setTimeout(function(){document.body.style.backgroundColor = "white";}, 100)
};
BadBB.addEventListener("click", function () {
              flashRed();
            });
};


