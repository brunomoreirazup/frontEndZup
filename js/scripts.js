//----------FUNÇÕES GET--------------
function buscarById(url,callback,i){
    var request = new XMLHttpRequest();
    request.open("GET",url,true);
    request.send();
    request.onreadystatechange = function(){
        if(this.readyState == 4){
            var response = JSON.parse(request.response);
            callback(response,i);
        }
    }
}

var globalCidades;
var globalClientes;

function buscarCidadesClientes(clientes,callback){
    var cidades = [];
    for(var i=0; i<clientes.length;i++){
        buscarById(clientes[i]._links.city.href,function(response,j){
            cidades.splice(j,0,response);
            if(cidades.length == clientes.length){
                globalCidades = cidades;
                globalClientes = clientes;
                callback(clientes,cidades);
            }
        },i);
    }
}
//////////////////////////////////////////////////////////////////////////

//--------------FUNÇÕES DE CONSTRUÇÃO--------------------------

function constroiTabelaCidade(url){
    buscarById(url,function(response){
        var cidades = response._embedded.cities;
        if(cidades == null){
            alert("Um erro ocorreu, não foi possível carregar a tabela");
        }
        $("#corpoTabela").html("");
        var html = "";
        for(var i = 0; i<cidades.length;i++){
            html += "<tr> " +
                "<td>" + cidades[i].name + "</td>" +
                "<td>" + "<button type='button' class='btn btn-dark' id='buttonExcluir' value=" + cidades[i]._links.self.href + " onclick='mostraModalCidade(this.value)'>Editar</button>" +
                "<button type='button' class='close' value=" + cidades[i]._links.self.href + " onclick='abreModalExcluir(this.value)'>&times;</button>" +
                "</td>" +
                "</tr>";
        }
        html = $(html);
        $("#corpoTabela").append(html);
        html.hide();
        html.each(function(i){
            $(this).delay(20*i).fadeIn(30*i);
        });
    });
}

function constroiTabelaCliente(url){
    buscarById(url,function(response){
        var clientes = response._embedded.customers;
        buscarCidadesClientes(clientes,function(clientes,cidades){
            var clientes=clientes;
            var cidades = cidades;
            if(clientes == null || cidades == null){
                alert("Um erro ocorreu, não foi possível carregar a tabela");
            }
            $("#corpoTabela").html("");
            html = "";
            for(var i = 0; i<clientes.length;i++){
                html += "<tr> " +
                    "<td>" + clientes[i].name + "</td>" +
                    "<td>" + cidades[i].name + "</td>" +
                    "<td>" + "<button type='button' class='btn btn-dark' value=" + clientes[i]._links.self.href + " onclick='mostraModalCliente(this.value)' >Editar</button>" +
                    "<button type='button' class='close' value=" + clientes[i]._links.self.href + " onclick='abreModalExcluir(this.value)'><span>&times;</span></button>" +
                    "</td>" +
                    "</tr>";
            }
            html = $(html);
            $("#corpoTabela").append(html);
            html.hide();
            html.each(function(i){
                $(this).delay(20*i).fadeIn(30*i);
            });
            });
    });
}

function constroiSelect(idSelect){
    var url = "https://customers-challenge.herokuapp.com/cities?sort=name";
    buscarById(url,function(response){
        var cidades = response._embedded.cities;
        if(cidades == null)
            alert("Ocorreu um erro ao carregar o select");
        var corpo = document.getElementById(idSelect);
        var html = "";
        for(var i=0; i < cidades.length;i++){
            html += "<option value=" + cidades[i]._links.self.href + " id="+ cidades[i]._links.self.href +  " >" +
                cidades[i].name + "</option>";
        }
        corpo.innerHTML = html;
    });
}
////////////////////////////////////////////////////////////////////////////////

//-------------------FUNÇÕES MODAL--------------------------

function mostraModalCidade(buttonId){
    buscarById(buttonId,function(response){
        $("#modalEditar").modal("show");
        var cidade = response;
        var editarCidade = document.getElementById("editarCidade");
        editarCidade.name = cidade._links.self.href;
        editarCidade.value = cidade.name;
    });

}

function mostraModalCliente(buttonId){
    $("#modalEditar").modal("show");
    $("#editarCliente").focus();
    buscarById(buttonId,function(response){
        var cliente = response;
        var editarCliente = document.getElementById("editarCliente");
        var selectEditar = document.getElementById("selectEditar");

        buscarById(cliente._links.city.href,function(response){
            for(var i =0; i<selectEditar.length;i++){
                if(selectEditar[i].value == response._links.city.href){
                    selectEditar.selectedIndex = i;
                    break;
                }
            }
            editarCliente.name =cliente._links.self.href.toString();
            editarCliente.value = cliente.name;
        });

    });
}


function resetaModalAdiciona(){
    $("#modalAdiciona").modal("show");
    var campoTexto = document.getElementById("campoTexto");
    campoTexto.value = "";
    $("#campoTexto").focus();
}


function abreModalExcluir(buttonId){
    var buttonConfirmaDelete = document.getElementById("buttonConfirmaDelete");
    buttonConfirmaDelete.value = buttonId;
    $("#modalExcluir").modal("show");
}




///////////////////////////////////////////////////////////////////////////

//---------------------FUNÇÕES DE DELETE------------------

function wrapperExcluiCidade(){
    var buttonId = document.getElementById("buttonConfirmaDelete").value;
    excluiCidade(buttonId,function(){
        var url = "https://customers-challenge.herokuapp.com/cities";
        constroiTabelaCidade(url);
    });
}

function excluiCidade(buttonId,callback){
    var url = "https://customers-challenge.herokuapp.com/customers"
    buscarById(url,function(response){
        var clientes = response._embedded.customers;
        buscarCidadesClientes(clientes,function(cidades){
            var cidadesClientes = cidades;

            var request = new XMLHttpRequest();
            request.open("DELETE",buttonId,true);
            request.send();

            request.onreadystatechange = function(){
                if(this.readyState == 4) {
                    if(this.status == 409){
                        alert("Cidade não pode ser excluida");
                    }
                    else {
                        callback();
                    }
                }
            }
        });
        });
}

function wrapperExcluiCliente(buttonId){
    var buttonId = document.getElementById("buttonConfirmaDelete").value;
    excluiCliente(buttonId,function(){
        var url = "https://customers-challenge.herokuapp.com/customers";
        constroiTabelaCliente(url);
    })
}

function excluiCliente(buttonId, callback){
    var request = new XMLHttpRequest();
    request.open("DELETE",buttonId,true);
    request.send();
    request.onreadystatechange = function(){
        if(this.readyState == 4) {
            if(this.status == 409){
                alert("Cidade não pode ser excluida");
            }
            else {
                callback();
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////

//------------FUNÇÕES PUT------------------

function editarDadosCidade(){
    var editarCidade = document.getElementById("editarCidade");
    putRequestCidade(editarCidade.name.toString(),editarCidade.value.toString(),function(){
        $("#modalEditar").modal("hide");
        var url = "https://customers-challenge.herokuapp.com/cities";
        constroiTabelaCidade(url);
    });
}

function editarDadosCliente(){
    var editarCliente = document.getElementById("editarCliente");
    var editarCidade = document.getElementById("selectEditar");
    patchRequestCliente(editarCliente.name.toString(),editarCliente.value.toString(),editarCidade.value.toString(),function(){
        $("#modalEditar").modal("hide");
        var url = "https://customers-challenge.herokuapp.com/customers";
        constroiTabelaCliente(url);
    });
}

function putRequestCidade(url,name,callback){
    var request = new XMLHttpRequest();
    request.open("PUT",url,true);
    request.setRequestHeader("Content-type", "application/hal+json;charset=UTF-8");
    conteudoJSON = {
        "name" : name
    }
    request.send(JSON.stringify(conteudoJSON));
    request.onreadystatechange = function(){
        if(this.readyState ==  4 && this.status == 200)
            callback();
    }
}

function patchRequestCliente(url,name,cidade,callback){
    var request =  new XMLHttpRequest();
    request.open("PATCH",url,true);
    request.setRequestHeader("Content-type", "application/hal+json;charset=UTF-8");
    conteudoJSON = {
        "name" : name,
        "city" : cidade
    }
    request.send(JSON.stringify(conteudoJSON));
    request.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200)
            callback();
    }
}

///////////////////////////////////////////////////////////////////////////////

//----------FUNÇÕES POST-----------------

function atualizaEnvioCidade(){
    enviarDadosCidade(function(){
        var url = "https://customers-challenge.herokuapp.com/cities";
        constroiTabelaCidade(url);
        $("#modalAdiciona").modal("hide");
    });
}

function atualizaEnvioCliente(){
    enviarDadosClientes(function(){
        var url = "https://customers-challenge.herokuapp.com/customers";
        constroiTabelaCliente(url);
        $("#modalAdiciona").modal("hide");
    });
}

function enviarDadosCidade(callback){
    var campoTexto = document.getElementById("campoTexto").value.toString();
    if(campoTexto == ""){
        alert("Insira uma cidade");
        document.getElementById("campoTexto").focus();
    }
    else {
        var conteudoJSON = {
            "name": campoTexto
        }


        var request = new XMLHttpRequest();
        request.open("POST", "https://customers-challenge.herokuapp.com/cities", true);
        request.setRequestHeader("Content-type", "application/hal+json;charset=UTF-8");
        request.send(JSON.stringify(conteudoJSON));
        request.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status != 201){
                    alert("Não foi possível inserir cidade");
                }
                else{
                    callback();
                }
            }
        }
    }
}

function enviarDadosClientes(callback){
    var nomeCliente = document.getElementById("nomeCliente").value.toString();
    if(nomeCliente == ""){
        alert("Insira um nome para cliente");
        document.getElementById("nomeCliente").focus();
    }
    else{
        var selectClientes = document.getElementById("selectClientes").value.toString();
        var conteudoJSON = {
            "name" : nomeCliente,
            "city" : selectClientes
        }

        var request = new XMLHttpRequest();
        request.open("POST","https://customers-challenge.herokuapp.com/customers", true);
        request.setRequestHeader("Content-type", "application/hal+json;charset=UTF-8");
        request.send(JSON.stringify(conteudoJSON));
        request.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status != 201){
                    alert("Não foi possível inserir cliente");
                }
                else{
                    callback();
                }
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////

//------FUNÇÕES DE BUSCA ---------------

function pesquisarCidade(){
    var cidade = document.getElementById("buscarCidade").value.toString();
    if(cidade!=""){
        var url = "https://customers-challenge.herokuapp.com/cities/search/findByNameIgnoreCaseContaining?name=";
        url+=cidade;
        constroiTabelaCidade(url);
    }
}

function pesquisarClientes(){
    var cliente = document.getElementById("buscarCliente").value.toString();
    if(cliente!=""){
        var url = "https://customers-challenge.herokuapp.com/customers/search/findByNameIgnoreCaseContaining?name=";
        url+=cliente;
        constroiTabelaCliente(url);
    }
}

///////////////////////////////////////////////////////////////////////////////

//------FUNÇÕES DE PAGINAÇÃO-----------

function proxPag(tipoTabela){
    var buttonAnt = document.getElementById("buttonAnt");

    buscarById(buttonAnt.name,function(response){
        var resposta = response;

        if(parseInt(resposta.page.totalPages,10) > (parseInt(resposta.page.number,10) + 1)){
            buttonAnt.name = resposta._links.next.href;
            console.log(buttonAnt.name);
            if(tipoTabela == "cidade")
                constroiTabelaCidade(buttonAnt.name);
            else
                constroiTabelaCliente(buttonAnt.name);
        }
    });
}

function antPag(tipoTabela){
    var buttonAnt = document.getElementById("buttonAnt");

    buscarById(buttonAnt.name,function(response){
        var resposta = response;

        if(parseInt(resposta.page.number,10) > 0){
            buttonAnt.name = resposta._links.prev.href;
            console.log(buttonAnt.name);
            if(tipoTabela == "cidade")
                constroiTabelaCidade(buttonAnt.name);
            else
                constroiTabelaCliente(buttonAnt.name);
        }
    });
}
///////////////////////////////////////////////////////////////////////////////