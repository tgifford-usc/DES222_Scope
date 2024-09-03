// This will let you send a string from your web interface back to the microbit
// It adds a "newline" character at the end of the string, so that the microbit
// program can tell the command is complete
function sendStringToMicrobit(str) {
  const serialComponent = document.querySelector('custom-serial');
  if (serialComponent) {
    serialComponent.writeToSerial(`${str}\n`);
  }
}

// put any javascript you need for your interface here
const NUM_POINTS = 100;
let plots = [];
// let voltageHistories = [];
// let voltagePlots = [];
let numPlots = 0;

let plotPanel = document.getElementById('plotPanel');
let plotPanelHeight = plotPanel.getBoundingClientRect().height;

function resizePlots() {
  plots.forEach((plot) => {
    plot.element.setAttribute('style', `width: 100vw; height: ${Math.round(plotPanelHeight / numPlots)}px`);    
  });
}

window.onresize = resizePlots;

function addPlot(title = '') {
  let element = document.createElement('div');
  element.id = `plot_${numPlots}`;
  plotPanel.appendChild(element);
  let plot = { element: element, history: Array(NUM_POINTS), title: title }
  plots.push(plot);
  ++numPlots;
  resizePlots();
}

const refreshPlots = function() {
  plots.forEach((plot, index) => {
    const trace1 = {
      x: [...Array(NUM_POINTS).keys()],
      y: plot.history,
      type: 'scatter'
    };

    const data = [trace1];
    const layout = { title: { text: plot.title } }
    
    Plotly.newPlot(`plot_${index}`, data, layout);
  })
}


const theSerialComponent = document.querySelector('custom-serial');
if (theSerialComponent) {
  theSerialComponent.customHandler = function(message) {
    let readings = message.split(",");
    if (readings && readings.length) {
      while (numPlots < readings.length) {
        addPlot();
      }
      readings.forEach((reading,index) => {
        let parts = reading.split("=");
        if (parts.length == 2) {
          let varName = parts[0];
          let varValue = parts[1];
          plots[index].title = varName;
          plots[index].history.shift(); plots[index].history.push(varValue);
        }
      });  
    }
    refreshPlots();
  }
}
