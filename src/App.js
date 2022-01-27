import ReactDOM from "react-dom";

let state = [];
let setters = [];
let stateIndex = 0

function createSetter(stateIndex){
    return function (newState){
        state[stateIndex] = newState
        render()
    }
}

function useState(initialState){
    state[stateIndex] = state[stateIndex] ? state[stateIndex] : initialState
    setters.push(createSetter(stateIndex))
    let value = state[stateIndex]
    let setter = setters[stateIndex]
    stateIndex++
    return [
        value,
        setter
    ]
}

let prevDepsAry = []
let effectIndex = 0

function useEffect(callback, deps){
    if (Object.prototype.toString.call(callback) !== '[object Function]'){
        throw new TypeError('effect callback muse be a function')
    }

    if (typeof deps === 'undefined'){
         // 没有传递 deps 数组
        callback()
    } else {
        if (Object.prototype.toString.call(deps) !== '[object Array]'){
            throw new TypeError('deps muse be a array')
        }

        let prevDeps = prevDepsAry[effectIndex]

        let hasChanged = prevDeps ? deps.every((dep, index) => dep === prevDeps[index]) === false : true

        if (hasChanged){
            callback()
        }

        prevDepsAry[effectIndex] = deps
        effectIndex++
    }
}

function render(){
    stateIndex = 0
    effectIndex = 0
    ReactDOM.render(<App />, document.getElementById('root'));
}

function useReducer(reducer, initialState){
    const [state, setState] = useState(initialState)
    function dispatch(action){
        const newState = reducer(state, action)
        setState(newState)
    }

    return [state, dispatch]
}

function App() {

    function reducer(state, action){
        switch (action.type){
            case 'increment':
                return state + 1;
            case 'decrement':
                return state - 1;
            default:
                return state
        }
    }


    const [count, dispatch] = useReducer(reducer, 0)
    return (
        <div>
            {count}
            <button onClick={() => dispatch({type: 'increment'})}>+1</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-1</button>
        </div>

    );
}


export default App;
