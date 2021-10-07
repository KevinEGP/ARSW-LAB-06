app = (function (){
  var totalPoints = null;
  var currentBlueprint = null;
  var data = [];
  var getFunction = function (input) {
      if(input != null){
          data = input.map(function(blueprint){
              return {key:blueprint.name, value:blueprint.points.length}
          })
          $("#table tbody").empty();
          data.map(function(blueprint){
              var tmp = '<tr><td id="authorName">'+blueprint.key+'</td><td id="points">'+blueprint.value+'</td><td type="button" onclick="app.drawBlueprint(\''+blueprint.key+'\')">Draw</td></tr>';
              $("#table tbody").append(tmp);
          })

          var totalPoints = data.reduce(function(total, valor){
              return {value: total.value + valor.value};
          })
          document.getElementById("authorLabel").innerHTML = author + ' Blueprints';
          document.getElementById("pointsLabel").innerHTML = totalPoints.value;
      }
  };

  var drawFunction = function (bp) {
      if (bp) {
          var x, y, cx, cy = null;
          var c = document.getElementById("canvas");
          var ctx = c.getContext("2d");

          ctx.clearRect(0, 0, 500, 500);
          ctx.beginPath();

          bp.points.map(function (p){
              if (x == null) {
                  x = p.x;
                  y = p.y;
              } else {
                  cx = p.x;
                  cy = p.y;
                  ctx.moveTo(x, y);
                  ctx.lineTo(cx, cy);
                  ctx.stroke();
                  x = cx;
                  y = cy;
              }
          });
      }
  }
  var isActive = 0;
    var inputData = null;
    listenerFunction = function () {
        var x, y, cx, cy = null;
        var c = document.getElementById("canvas");
        var ctx = c.getContext("2d");
        inputData = [];
        if( isActive == 1 ){
            c.removeEventListener("click", fun, false);
            isActive =0;
        }
        isActive=isActive+1;
        c.addEventListener("click", fun = function (evt) {
            mousePos = getMousePos(c, evt);
            var coordinate = [mousePos.x,mousePos.y];
            inputData.push(coordinate);
            if (x == null) {
                x = mousePos.x;
                y = mousePos.y;
            } else {
                cx = mousePos.x;
                cy = mousePos.y;
                ctx.moveTo(x, y);
                ctx.lineTo(cx, cy);
                ctx.stroke();
                x = cx;
                y = cy;
            }
        }, false);
    };
    var saveBlueprint = function () {
        var blueprintsArray = [];
        currentBlueprint.points.map(function (value) {
            blueprintsArray.push(value);
        });
        inputData.map( function (valor) {
            var x1=valor[0];
            var y1=valor[1];
            blueprintsArray.push({x:x1,y:y1});

        });
        currentBlueprint.points = blueprintsArray;
        putBlueprint();
        document.getElementById("pointsLabel").innerHTML = totalPoints+inputData.length-1;
    };
    var putBlueprint = function(){
        if (currentBlueprint != null){
            $.ajax({
                url: "/blueprints/"+currentBlueprint.author+"/"+currentBlueprint.name,
                type: 'PUT',
                data: JSON.stringify(currentBlueprint),
                contentType: "application/json"
            });
        }
        else {
            alert("Error.");
        }
    }
    var deleteBlueprint = function(){
        var prom = $.ajax({
            url: "/blueprints/"+currentBlueprint.author+"/"+currentBlueprint.name,
            type: 'DELETE',
            contentType: "application/json"
        });

        prom.then(
            function(){
                console.info('Delete OK');
            },
            function(){
                console.info('Delete Fallo');
            }
        );
        return prom;
    }
    var responseAll = null;
    var totalBlueprints = function(){
        allBlueprints=$.get("http://localhost:8080/blueprints");
        allBlueprints.then(
            function (data) {
                responseAll = data;
            },
            function () {
                alert("$.get failed!");
            }
        );
        return responseAll;
    };

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return{
             x: evt.clientX - rect.left,
             y: evt.clientY - rect.top
        };
    }
  
  return {
          blueprintsAuthor: function () {
              author = document.getElementById("author").value;
              apimock.getBlueprintsByAuthor(author,getFunction);

          },

          drawBlueprint: function(name) {
              author = document.getElementById("author").value;
              obra = name;
              apimock.getBlueprintsByNameAndAuthor(author,obra,drawFunction);
          },
          allBlueprints: totalBlueprints,
          listener: listenerFunction,
          update: saveBlueprint,
          delete: deleteBlueprint
      };
})();