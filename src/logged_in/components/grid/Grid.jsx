import './Grid.css'
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import RGL, { WidthProvider } from "react-grid-layout";
import _ from "lodash";
import { SelectMenu } from './selectmenu/SelectMenu';
import ActionMenu from './actionmenu/ActionMenu';
import NewDashboard from './newdashboard/NewDashboard';
import { useSelector } from 'react-redux';
import { saveGridElements, fetchGridElements, deleteGrid, fetchFinancialHistory } from '../../../shared/functions/requests.js';
import { getCardProps, getRestoredItems } from './gridProps'
import { useSnackbar } from 'notistack';



const ResponsiveReactGridLayout = WidthProvider(RGL);
/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
function Grid(props) {
  const {
    selectGrid
  } = props;
  useEffect(selectGrid, [selectGrid]);

  let initialGridItems = {
    items: []
  };
  const [gridItems, setGridItems] = useState(initialGridItems)
  const [gridElements, setGridElements] = useState([])
  const [allDashboards, setAllDashboards] = useState([])
  const [layout, setLayout] = useState([])
  const [identifier, setIdentifier] = useState(undefined)
  const [gridId, setGridId] = useState(undefined)
  const [gridStartup, setGridStartup] = useState({ id: undefined, identifier: undefined, newGridElements: undefined })
  const userId = useSelector(state => state.auth.id)
  const token = useSelector(state => state.auth.token)
  const [firstSave, setFirstSave] = useState(true)
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Restoure cards when starting
   */
  useEffect(() => {
    fetchGridElements(userId, token)
      .then(dashboards => {
        if (dashboards.length > 0) {
          setAllDashboards(dashboards)
          let toBeRestored = dashboards.find(r => {
            return r.active === true
          })
          if (toBeRestored) {

            setGridId(toBeRestored.id)
            setIdentifier(toBeRestored.identifier)
            setGridStartup({ id: toBeRestored.id, identifier: toBeRestored.identifier, newGridElements: toBeRestored.gridElements })
          }
        }
      })
  }, [userId, token])

  /**
   * Triggers the restauration process whenn all states for startup are setted
   */
  useEffect(() => {
    console.log("STARTANDO", gridStartup.identifier, gridStartup.newGridElements)
    if (typeof gridStartup.identifier !== 'undefined' && typeof gridStartup.newGridElements !== 'undefined') {
      restoreItems(gridStartup.newGridElements, gridStartup.identifier)
    }
  }, [gridStartup])

  const restoreItems = useCallback((newGridElements, newIdentifier) => {

    let newLayout = []
    setGridElements([])
    newGridElements.forEach(g => {
      onRestauringItems(g, newIdentifier, g.layout)
      newLayout.push(g.layout)
    })
    setLayout(newLayout)
  }, [gridItems, gridElements, layout, identifier, userId, gridId])

  const onRestauringItems = useCallback((g, ticker, props) => {

    const functions = {
      onRemoveItem: onRemoveItem,
      changeParams: changeParams
    }

    let res = getRestoredItems(g, ticker, props, functions)

    setGridElements(prev => {
      prev.push(res.gridElements)
      return prev
    })
    setGridItems(prev => {
      prev.items.push(res.gridItems)
      return prev
    }
    );


  }, [gridId, identifier])

  /**
   * Save on Layoutchange
   */
  useEffect(() => {

    console.log("first s, gridid", firstSave, gridId)
    if (firstSave || gridId != undefined) {
      if (gridElements && layout && gridElements.length == layout.length) {
        if (identifier && gridElements && layout.length !== 0) {
          saveGridElements(gridId, identifier, userId, gridElements, token)
            .then(res => {
              setGridId(res)
            })
          setAllDashboards(prev => {
            prev.find(el => { return el.active === true }).gridElements = gridElements
            prev.find(el => { return el.active === true }).layout = layout
            setFirstSave(false)
            return prev
          })
        }
      }
    }
  }, [layout])

  /**
   * Math.random should be unique because of its seeding algorithm.
   * Convert it to base 36 (numbers + letters), and grab the first 9 characters
   * after the decimal.
   * @returns a random Id
   */
  const randomId = () => {
    return '_' + Math.random().toString(36).substr(2, 9).toString();
  }

  const onAddItem = (type, ticker, iTemp = randomId()) => {
    ticker = ticker ? ticker : identifier
    const functions = {
      onRemoveItem: onRemoveItem,
      changeParams: changeParams
    }
    setGridItems(prev => {
      prev.items.push(getCardProps(type, functions, gridItems, ticker, iTemp))
      return prev
    });
    setGridElements(gridElements.concat({ id: iTemp, type: type, params: {} }))
    setAllDashboards(prev => {
      prev.find(d => d.active === true).gridElements.push({ id: iTemp, type: type, params: props.params })
      return prev
    })

  }

  // We're using the cols coming back from this to calculate where to add new items.
  const onBreakpointChange = (breakpoint, cols) => {
    // setGridItems({
    //   breakpoint: breakpoint,
    //   cols: cols
    // });
  }

  const onLayoutChange = useCallback((layout_) => {
    console.log("LAYOUT CHANGE")

    setGridElements(prev => {
      if (prev) {
        prev.forEach(g => {
          g['layout'] = layout_.find(l => l.i === g.id)
        })
      }
      return prev
    })
    setLayout(layout_)
  }, [gridElements, layout])


  function changeParams(params) {
    let newGridEl
    setGridElements(prev => {
      var foundIndex = prev.findIndex(x => x.id === params.id);
      prev[foundIndex].params = params.content;
      newGridEl = prev
      return prev

    }
    );
    console.log("CHange params", gridId, identifier, userId, newGridEl, token)
    if (typeof identifier !== 'undefined' && typeof gridId !== 'undefined' && token && typeof newGridEl !== 'undefined') {
      saveGridElements(gridId, identifier, userId, newGridEl, token)
    }
  }

  function onRemoveItem(rId) {
    setGridItems(prev => {
      return {
        ...prev,
        items: prev.items.filter((el) => el.i !== rId)
      }
    }
    );
    setGridElements(prev => {
      return prev.filter(el => el.id !== rId)
    }
    );
    setAllDashboards(prev => {
      prev.find(d => d.active === true).gridElements.filter(el => el.id !== rId)
      return prev
    })

  }


  const chooseIdentifier = (ticker) => {
    setAllDashboards(prev => {
      prev.map(d => {
        if (d.active === true) {
          d.active = false
        }
        return d
      })
      prev.push({ active: true, gridElements: [], identifier: ticker, layout: [] })
      return prev
    })
    setGridItems(initialGridItems)
    setGridElements([])
    setIdentifier(ticker)
    setFirstSave(true)

    onAddItem('card', ticker)
  }

  const newDashboard = () => {
    setGridId(undefined)
    setGridItems(initialGridItems)
    setGridElements([])
    setLayout([])
    setIdentifier(undefined)

  }

  const selectDashboard = (el) => {
    setGridItems(initialGridItems)
    setGridElements([])
    setLayout([])
    let selectedDashboard
    allDashboards.map(d => {
      if (d.identifier === el) {
        selectedDashboard = d
        d.active = true
      } else {
        d.active = false
      }
      return
    })
    if (selectedDashboard) {
      console.log("selectedDashboard.id, selectedDashboard.identifier, selectedDashboard.gridElements", selectedDashboard.id, selectedDashboard.identifier, selectedDashboard.gridElements)
      // setGridStartup(selectedDashboard.id, selectedDashboard.identifier, selectedDashboard.gridElements)
      restoreItems(
        selectedDashboard.gridElements,
        selectedDashboard.identifier)
      setGridId(selectedDashboard.id)
      setIdentifier(selectedDashboard.identifier)
    }
  }

  /**
   * Delete a Dashboard.
   *
   * @param {string} d The desired identifier to be deleted ex. "AAPL".
   */
  const deleteDashboard = () => {
    let next

    allDashboards.forEach(d => {
      if (d.identifier !== identifier) {
        next = d.identifier;
        return
      }
    })

    setAllDashboards(prev => {
      return prev.filter(d => d.identifier !== identifier)
    })
    deleteGrid(gridId, token).then(() => {
      notify('Dashboard Deleted', 'success')
    }).catch(e => {
      notify(e, 'error')
    })
    if (next) {
      selectDashboard(next)
    } else {
      newDashboard()
    }

  }

  const notify = (msg, variant) => {
    // variant could be success, error, warning, info, or default
    console.log('notify')
    enqueueSnackbar(msg, { variant });
  };


  if (identifier) {
    return (
      <div>
        <ActionMenu onClose={onAddItem} handleDeletDashboard={deleteDashboard} handleAddDashboard={newDashboard} />
          <SelectMenu selectDashboard={selectDashboard} identifier={identifier} handleDeletDashboard={deleteDashboard} handleAddDashboard={newDashboard} />
          <ResponsiveReactGridLayout
            onLayoutChange={onLayoutChange}
            onBreakpointChange={onBreakpointChange}
            {...props}
            rowHeight={99}
            columnHeight={100}
          >
            {_.map(gridItems.items, el => { return el.content })}
          </ResponsiveReactGridLayout>
          <br />
          {/* <button onClick={() => {
            fetchFinancialHistory(identifier, token)
              .then(res => console.log("alcpaah deu", res))
          }}>testfunction</button> */}
          {/* <News/> */}
      </div>
    )
  } else {
    return (
      <div>
        {/* <NewGridDialog chooseIdentifier={(ticker) => { chooseIdentifier(ticker) }} /> */}
        <NewDashboard chooseIdentifier={(ticker) => { chooseIdentifier(ticker) }} />
      </div>

    )
  }





}

Grid.propTypes = {
  selectGrid: PropTypes.func.isRequired,
};

export default Grid;