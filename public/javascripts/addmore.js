$(document).ready(function(){

    var pcounter = 2;
    var scounter = 2;
    
    $("#addProduct").click(function () {
    
    var newTextBoxDiv = $(document.createElement('div'))
         .attr("id", 'productDiv' + pcounter);
                  
    newTextBoxDiv.after().html('<tr><td class="col250"><span class="labels">Product #'+ pcounter + ' : </span> <input type="textbox" id="product' 
        + pcounter + '" value="" ></td><td><span class="labels">Price : </span><input type="textbox" id="proPrice' + pcounter +
        '" class="tiny"></td><td><span class="labels">Quantity: </span><input type="textbox" id="proQuantity' + pcounter +'" class="tiny"></td></tr>');
              
    newTextBoxDiv.appendTo("#productGroup");

        
    pcounter++;
  });
    $("#addService").click(function () { 
    
    var newTextBoxDiv = $(document.createElement('div'))
         .attr("id", 'serviceDiv' + scounter);
                  
    newTextBoxDiv.after().html('<tr><td class="col250"><span class="labels">Service #'+ scounter + ' : </span> <input type="textbox" id="service' 
        + scounter + '" value="" ></td><td><span class="labels">Price : </span><input type="textbox" id="servPrice' + scounter +'" class="tiny"></td></tr>');
              
    newTextBoxDiv.appendTo("#serviceGroup");

        
    scounter++;
  });


  $("#removeProduct").click(function () {
    if(pcounter==2){
          return false;
       }   
        
     pcounter--;
      
    $("#productDiv" + pcounter).remove();
      
  });

$("#removeService").click(function () {
    if(scounter==2){
          return false;
       }   
        
     scounter--;
      
    $("#serviceDiv" + scounter).remove();
      
  });

    
     $("#getButtonValue").click(function () {
    
  var msg = '';
  for(i=1; i<pcounter; i++){
      msg += "\n Textbox #" + i + " : " + $('#product' + i).val();
  }
        alert(msg);
     });
  });