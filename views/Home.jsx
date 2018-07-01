var React = require("react");
var LayoutContainer = require('./layouts/main.jsx');


const titleStyle = {
  textAlign: 'center',
  color: '#ffb623',
  fontFamily: "'Pacifico', cursive",
  fontSize: '60px'
}

const info = {
  listStyleType: 'none',
  height: '300px',
  width: '200px',
  display: 'inline-block',
  }

const centerinfo = {
  position: 'relative',
  float: 'left',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display:'inline-block'
}

const text = {
  textAlign: 'center',
  fontFamily: "'Montserrat', sans-serif"
}

const button = {
  background: 'green',
  height: '20px',
  width: '55px',
  textAlign: 'center',
  borderRadius: '7px',
  margin: '2px'
}

const divStyle = {
  marginTop: '5px',
}

const inlineStyle = {
  display: 'inline-block',

}
class Home extends React.Component {
  render() {
    console.log(this);
    return (
      <LayoutContainer>
        <h1 style={titleStyle}>Welcome to Pokedex</h1>
          <ul>
            {this.props.pokemon.map(pokemon => (
              <li key={pokemon.id} style={info}>
                <div style={centerinfo}>
                  <img src={pokemon.img}/>
                  <p style={text}>{pokemon.name}</p>
                  <p style={text}>{pokemon.num}</p>
                  
                  <div>
                    <form
                    style={inlineStyle}
                    method="GET"
                    action={"/pokemon/"+ pokemon.id + "/edit"}>
                      <button style={button}>Edit</button>
                    </form>
                    <form
                    style={inlineStyle}
                    method="POST"
                    action={"/pokemon/"+ pokemon.id + "?_method=DELETE"}>
                      <button style={button}>Delete</button>
                    </form>
                  </div>

                </div>
              </li>
            ))}
          </ul>
      </LayoutContainer>
    );
  }
}

module.exports = Home;
