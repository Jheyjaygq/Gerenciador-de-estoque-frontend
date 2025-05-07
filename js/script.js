// Carrega as categorias no select (usado tanto no cadastro quanto no index)
function carregarCategorias() {
  fetch("http://localhost:8080/categoria")
    .then((res) => res.json())
    .then((categorias) => {
      const select = document.getElementById("categorias");
      if (select) {
        select.innerHTML = "";
        categorias.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.nome;
          select.appendChild(option);
        });
      }
    });
}

// Carrega os produtos e exibe na index
function carregarProdutos() {
  fetch("http://localhost:8080/produto")
    .then((res) => res.json())
    .then((produtos) => {
      const lista = document.getElementById("container");
      if (!lista) return;
      lista.innerHTML = "";

      produtos.forEach((produto) => {
        const div = document.createElement("div");
        div.classList.add("caixa-produto");
        div.innerHTML = `
          <img src="${produto.imagem}" alt="${produto.nome}" />
          <p>${produto.nome}</p>
          <p>${produto.categoria.nome}</p>
          <p>R$ ${produto.preco.toFixed(2)}</p>
          <p>${produto.quantidade}</p>
          <i class="fa-solid fa-trash" onclick="excluirProduto(${produto.id})"></i>
          <i class="fa-solid fa-pen-to-square" onclick="editarProduto(${produto.id})"></i>
        `;
        lista.appendChild(div);
      });
    });
}

// Cadastrar nova categoria
const formCategoria = document.querySelector(".form-categoria");
if (formCategoria) {
  formCategoria.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = document.getElementById("nome-categoria").value;

    fetch("http://localhost:8080/categoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Categoria cadastrada com sucesso!");
        formCategoria.reset();
        carregarCategorias();
      });
  });
}

// Evento de submit do produto (cadastro e edição)
const formProduto = document.querySelector(".form-produto");
if (formProduto) {
  formProduto.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const imagem = document.getElementById("imagem").value;
    const categoriaId = parseInt(document.getElementById("categorias").value);
    const id = formProduto.getAttribute("data-editar");

    const produto = {
      nome,
      preco,
      quantidade,
      imagem,
      categoria: { id: categoriaId }
    };

    const url = id ? `http://localhost:8080/produto/${id}` : "http://localhost:8080/produto";
    const method = id ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { ...produto, id: parseInt(id) } : produto)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar produto");
        return res.json();
      })
      .then(() => {
        alert(id ? "Produto atualizado com sucesso!" : "Produto salvo com sucesso!");
        localStorage.removeItem("produtoEditado");
        formProduto.reset();
        window.location.href = "index.html";
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao salvar produto.");
      });
  });
}

// Excluir produto
function excluirProduto(id) {
  const confirmar = confirm("Deseja realmente excluir este produto?");
  if (!confirmar) return;
  fetch(`http://localhost:8080/produto/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir produto");
      return res.json();
    })
    .then(() => {
      alert("Produto excluído com sucesso!");
      carregarProdutos();
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao excluir produto.");
    });
}

// Editar produto
function editarProduto(id) {
  fetch(`http://localhost:8080/produto/${id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erro ao carregar produto: ${res.status} - ${res.statusText}`);
      }
      return res.json();
    })
    .then(produto => {
      localStorage.setItem("produtoEditado", JSON.stringify(produto));
      window.location.href = "cadastro.html";
    })
    .catch(err => {
      console.error("Erro ao carregar produto para edição", err);
      alert("Erro ao carregar produto para edição.");
    });
}


function buscarProduto(nome) {
  fetch(`http://localhost:8080/produto/buscar?nome=${encodeURIComponent(nome)}`)
    .then((res) => res.json())
    .then((produtos) => {
      exibirProdutos(produtos);
    })
    .catch((err) => {
      console.error("Erro ao buscar produtos:", err);
      alert("Erro ao buscar produtos.");
    });
}
// Função genérica para exibir produtos
function exibirProdutos(produtos) {
  const lista = document.getElementById("container");
  lista.innerHTML = "";

  produtos.forEach((produto) => {
    const div = document.createElement("div");
    div.classList.add("caixa-produto");
    div.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" />
      <p>${produto.nome}</p>
      <p>${produto.categoria.nome}</p>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <p>${produto.quantidade}</p>
      <i class="fa-solid fa-trash" onclick="excluirProduto(${produto.id})"></i>
      <i class="fa-solid fa-pen-to-square" onclick="editarProduto(${produto.id})"></i>
    `;
    lista.appendChild(div);
  });
}
const formBusca = document.getElementById("form-busca");
if (formBusca) {
  formBusca.addEventListener("submit", function (e) {
    e.preventDefault();
    const termo = document.getElementById("input-busca").value.trim();
    if (termo.length > 0) {
      buscarProduto(termo);
    } else {
      carregarProdutos(); // mostra todos se a busca estiver vazia
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  carregarCategorias();
  carregarProdutos();

  const produtoEditado = localStorage.getItem("produtoEditado");
  if (produtoEditado && formProduto) {
    const produto = JSON.parse(produtoEditado);
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("imagem").value = produto.imagem;

    // Aguarda carregar categorias antes de setar o valor
    setTimeout(() => {
      document.getElementById("categorias").value = produto.categoria.id;
    }, 100);

    formProduto.setAttribute("data-editar", produto.id);
  } else if (formProduto) {
    // Se não for edição, limpa qualquer resto
    localStorage.removeItem("produtoEditado");
    formProduto.reset();
  }
});
