import './Grid.css'
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import { TableGrid } from './table/Table';
import { CardGrid } from './card/Card';
import { NoteGrid } from './note/Note';
import { SelectMenu } from './selectmenu/SelectMenu';
import ActionMenu from './actionmenu/ActionMenu';
import LineChartCard from './LineChart/LineChartCard';
import BarChartCard from './BarChart/BarChartCard';
import { useSelector, useDispatch } from 'react-redux';
import NewGridDialog from './NewGridDialog'
// import { setGridElements } from '../../../shared/redux/actions/grid.actions'
import { saveGridElements, fetchGridElements } from '../../../shared/functions/requests.js';

const ResponsiveReactGridLayout = WidthProvider(Responsive);
/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
function Grid(props) {

  let initialGridItens = {
    items: [],
    newCounter: 0
  };

  const [gridItens, setGridItens] = useState(initialGridItens)
  const [gridElements, setGridElements] = useState([])
  const [layout, setLayout] = useState([])
  const [identifier, setIdentifier] = useState(undefined)
  const user = useSelector(state => state.auth.user)
  // const {
  //   selectGrid
  // } = props;

  // useEffect(selectGrid, [selectGrid]);
  let gridItens_; let gridElements_ = []
  const restoreItens = useCallback((gridElements, layout, identifier) => {
    gridItens_ = initialGridItens
    setIdentifier(identifier)
    setLayout(layout)
    layout.sort(function (a, b) {
      return a.y - b.y;
    });

    layout.forEach(l => {
      let g = gridElements.find(g => l.i === g.id)
      onRestauringItems(g, identifier, l)
    })
    console.log("GRID ITENS FINAL", gridItens_)
    setGridItens(gridItens_)
    setGridElements(gridElements_)
  }, [gridItens, gridElements, layout, identifier])

  useEffect(() => {
    fetchGridElements(user)
      .then(response => {
        console.log('response fetch', response)
        // setGridElements(response.data.grid_elements)
        restoreItens(
          response.data.grid_elements,
          response.data.layout,
          response.data.identifier)

      })
  }, [user])

  const createElement = (el) => {
    if (el.type) {
      return el.content
    } else {
      const i = el.i;
      return (
        <div key={i} data-grid={el} className="grid-wrapper">
          {el.content ? el.content : ''}
        </div>
      );

    }
  }

  const onAddItem = (type, ticker, iTemp = "n" + gridItens.newCounter) => {
    ticker = ticker ? ticker : identifier

    let props = {
      params: {},
      i: iTemp,
      x: (gridItens.items.length * 2) % (gridItens.cols || 12),
      y: -99, // puts it at the bottom
    }
    console.log("adding", iTemp)
    if (type === 'note') {
      props = {
        ...props,
        w: 3,
        h: 2,
        minH: 3,
        maxW: 3,
        minH: 2,
        onRemoveItem: onRemoveItem,
        changeParams: changeParams
      }
      setGridItens({
        items: gridItens.items.concat(NoteGrid(props)),
        newCounter: gridItens.newCounter + 1
      });

    } else if (type === 'card') {
      props = {
        ...props,
        w: 3,
        h: 2,
        minW: 2,
        maxW: 3,
        minH: 2,
        maxH: 2,
        onRemoveItem: onRemoveItem,
        changeParams: changeParams,
        identifier: ticker
      }
      setGridItens({
        items: gridItens.items.concat(CardGrid(props)),
        newCounter: gridItens.newCounter + 1
      });

    } else if (type === 'table') {

      props = {
        ...props,
        w: 6,
        h: 2,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      setGridItens({
        items: gridItens.items.concat(TableGrid(props)),
        newCounter: gridItens.newCounter + 1
      });

    } else if (type === 'pricechart') {
      props = {
        ...props,
        w: 5,
        h: 2,
        params: "1 Month",
        identifier: ticker,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      setGridItens({
        items: gridItens.items.concat(LineChartCard(props)),
        newCounter: gridItens.newCounter + 1
      });
    }

    else if (type === 'dividendchart') {
      props = {
        ...props,
        w: 5,
        h: 2,
        params: "6 Months",
        identifier: ticker,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      setGridItens({
        items: gridItens.items.concat(BarChartCard(props)),
        newCounter: gridItens.newCounter + 1
      });
    }

    setGridElements(gridElements.concat({ id: iTemp, type: type, params: props.params }))

  }
  const onRestauringItems = (g, ticker, props) => {
    let type = g.type
    let  iTemp = g.id
    let params = g.params
    props = {...props, params: params}
    console.log("onRestauringItems", type, ticker, iTemp)
    console.log("setGridElements", gridElements)
    ticker = ticker ? ticker : identifier

    if (type === 'note') {
      props = {
        ...props,
        onRemoveItem: onRemoveItem,
        changeParams: changeParams
      }
      gridItens_.items.push(NoteGrid(props))
      gridItens_.newCounter += 1
      

    } else if (type === 'card') {
      props = {
        ...props,
        identifier: ticker,
        onRemoveItem: onRemoveItem,
        changeParams: changeParams,
      }
      gridItens_.items.push(CardGrid(props))
      gridItens_.newCounter += 1
      

    } else if (type === 'table') {

      props = {
        ...props,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      gridItens_.items.push(TableGrid(props))
      gridItens_.newCounter += 1
      

    } else if (type === 'pricechart') {
      props = {
        ...props,
        identifier: ticker,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      gridItens_.items.push(LineChartCard(props))
      gridItens_.newCounter += 1
      
    }

    else if (type === 'dividendchart') {
      props = {
        ...props,
        identifier: ticker,
        onRemoveItem: () => onRemoveItem(iTemp),
        changeParams: changeParams
      }
      gridItens_.items.push(BarChartCard(props))
      gridItens_.newCounter += 1
      
    }
    console.log("PARAAAAMS", { id: iTemp, type: type, params: params })
    gridElements_.push({ id: iTemp, type: type, params: params })
  

  }

  // We're using the cols coming back from this to calculate where to add new items.
  const onBreakpointChange = (breakpoint, cols) => {
    // setGridItens({
    //   breakpoint: breakpoint,
    //   cols: cols
    // });
  }

  const onLayoutChange = (layout) => {
    console.log("layoutchange", layout, identifier, gridElements)
    if (identifier && gridElements.length) {
      saveGridElements(identifier, user, gridElements, layout)
        .then(res => console.log("res save ", res))
    }
    // props.onLayoutChange(layout);
    // setGridItens({ layout: layout });
  }

  function changeParams(params) {
    setGridElements(prev => {
      console.log("CHANGE PARAMS", params, prev)
      var foundIndex = prev.findIndex(x => x.id == params.id);
      console.log("CHANGE PARAMS 2", foundIndex)
      prev[foundIndex].params = params.content;
      return prev
    }
    );

  }
  function onRemoveItem(rId) {
    setGridItens(prev => {
      return {
        ...prev,
        items: prev.items.filter((el) => el.i != rId),
        newCounter: prev.newCounter
      }
    }
    );
    setGridElements(prev => {
      return prev.filter( el => el.id != rId)
    }
    );

  }


  const chooseIdentifier = (ticker) => {
    setIdentifier(ticker)
    onAddItem('card', ticker)
  }

  const testfunction = () =>{
    console.log("testfunction", gridElements)
  }


  if (identifier) {
    return (
      <div>
        <SelectMenu />
        <ActionMenu onClose={onAddItem} />
        <ResponsiveReactGridLayout
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
          {...props}
          rowHeight={99}
          columnHeight={100}
        >
          {_.map(gridItens.items, el => createElement(el))}
        </ResponsiveReactGridLayout>
        <br />
        <button onClick={() => testfunction()}>testfunction</button>
      </div>
    )
  } else {
    return (
      <div>
        <NewGridDialog chooseIdentifier={(ticker) => { chooseIdentifier(ticker) }} />
      </div>

    )
  }





}

Grid.propTypes = {
  selectGrid: PropTypes.func.isRequired,
};

export default Grid;