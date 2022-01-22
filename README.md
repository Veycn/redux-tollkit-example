
# 概述
在使用 `Redux` 开发项目的时候，不可避免的需要编写诸多的模板代码（重复代码），`Redux Toolkit` 本质上是对 `redux` 的二次封装，提升开发效率。

# 状态切片
对于状态切片，我们可以认为它就是原本 `Redux` 中的那一个个的小的 `Reducer` 函数。
在 `Redux` 中，原本 `Reducer` 函数和 `Action` 对象需要分别创建，现在通过状态切片替代，它会返回 `Reducer` 函 数和 `Action` 对象.

- `reducers` 中接收的是 `同步的 action`
- `extraReducers` 中可以接收异步的 `action`，这个在下面异步操作中会提到。

```javascript
import { createSlice } from '@reduxjs/toolkit'

// 给这个状态切片起个 nice 的名字
export const TODOS_FEATURE_KEY = 'todos'

// 有 redux 基础就不难看懂，createSlice 返回了 reducer 和 action
// reducer 到时候交给 全局的 store
// action 会在具体的业务中触发
const { reducer: TodosReducer, actions } = createSlice({
    name: TODOS_FEATURE_KEY,
    initialState: [],
    reducers: {
        addTodo: (state, action) => {
            return state.push(action.payload)
        }
    }
})

// 将 actions 结构后导出
export const { addTodo } = actions
export default TodosReducer
```

# 创建 store

`@reduxjs/toolkit` 提供了一个 `configureStore` 用来配置 `store` .使用的方式很简单。

```javascript

import { configureStore } from '@reduxjs/toolkit'
import TodosReducer, { TODOS_FEATURE_KEY } from "./todos.slice";

export default configureStore({
    reducer: {
        [TODOS_FEATURE_KEY]: TodosReducer
    },
    devTools: process.env.NODE_ENV !== 'production'
})

```

使用姿势：

```javascript
import {useDispatch, useSelector} from 'react-redux'
import {addTodo, TODOS_FEATURE_KEY} from "../../Store/todos.slice";

function Main() {
    // 通过 useDispatch 拿到 dispatch
    const dispatch = useDispatch()
    // 通过 useSelector 拿到状态
    const todos = useSelector(state => state[TODOS_FEATURE_KEY])
    return (
        <section className="main">
	    // 点击按钮新建 todo
            <button onClick={() => dispatch(addTodo({title: '测试'}))}>
                添加任务
            </button>
            <ul className="todo-list">
                {
                    todos.map(todo => ()
                }
            </ul>
        </section>
    )
}

export default Main

```


# action 预处理

当 `Action` 被触发后, 可以通过 `prepare` 方法对 `Action` 进行预处理, 处理完成后交给 `Reducer`. `prepare` 方法必须返 回对象.

比如之前创建 `todo` 的时候，没有给 `id`，这里通过 `prepare` 给 `todo` 加上一个随机的 `id`，如果 配置了 `prepare` 属性，`action` 会先由 `prepare` 处理之后再交给 `reducer` 处理。

```javascript
const {reducer: TodosReducer, actions} = createSlice({
    name: TODOS_FEATURE_KEY,
    initialState: [],
    reducers: {
        addTodo: {
            reducer: (state, action) => {
                state.push(action.payload)
            },
            prepare: todo => {
                return { payload: { ...todo, id: Math.random() } }
            }
        }
    }
})
```

# 异步操作

## 方式一 createAsyncThunk
```javascript
// define async
export const loadTodo = createAsyncThunk(
    'todos/loadTodos', 
    (payload, thunkAPI) => {
    axios.get('http://localhost:3001/todos').then(res =>{
        thunkAPI.dispatch(setTodos(res.data)
    }))
})

const {reducer: TodosReducer, actions} = createSlice({
    ...,
    reducers: {
        addTodo: ...,
        setTodos: (state, action) => {
            action.payload.forEach(todo => state.push(todo))
        }
    }
})

// usage

import {useDispatch} from 'react-redux'
import {loadTodo} from "../../Store/todos.slice";

function Main() {
    const dispatch = useDispatch()
    // useEffect 中 dispacth 异步操作，加载数据
    useEffect(() => {
        dispatch(loadTodo())
    }, [])
    return (...)
}

export default Main
```

## 方式二 extraReducers


```javascript
export const loadTodos = createAsyncThunk('todos/loadTodos', (payload, thunkAPI) => {
    // 返回这个 promise
    return axios.get('http://localhost:3001/todos').then(res => res.data)
})

const {reducer: TodosReducer, actions} = createSlice({
    name: TODOS_FEATURE_KEY,
    initialState: [],
    reducers: {
        addTodo: {
            reducer: (state, action) => {
                state.push(action.payload)
            },
            prepare: todo => {
                return { payload: { ...todo, id: Math.random() } }
            }
        },
    },
    extraReducers: {
	// 加载函数返回的 promise 的每一个状态都可以做相应的事情
        [loadTodos.fulfilled]: (state, action) => {
            action.payload.forEach(todo => state.push(todo))
        },
        [loadTodos.pending]: (state, action) => {
            return state
        },
        [loadTodos.rejected]: (state, action) => {},
    }
})

```

# 配置中间件

> 需要注意的点是需要通过 `getDefaultMiddleware` API，将默认的中间件获取过来放入数组中，否则这些默认的中间件将会失效。

```javascript

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import TodosReducer, { TODOS_FEATURE_KEY } from "./todos.slice";
import logger from 'redux-logger'

export default configureStore({
    middleware: [...getDefaultMiddleware(), logger],
    reducer: {
        [TODOS_FEATURE_KEY]: TodosReducer
    },
    devTools: process.env.NODE_ENV !== 'production'
})
```

# 实体适配器

实体适配器可以简化一些 reducer 的操作.

```javascript
import {createEntityAdapter} from '@reduxjs/toolkit'
const todosAdapter = createEntityAdapter()
const {reducer: TodosReducer, actions} = createSlice({
    // 初始状态需要通过 todosAdapter.getInitialState() 获取
    initialState: todosAdapter.getInitialState(),
    reducers: {
        addTodo: {
            reducer: todosAdapter.addOne,
            prepare: todo => {
                return { payload: { ...todo, id: Math.random() } }
            }
        },
    },
    extraReducers: {
        [loadTodos.fulfilled]: todosAdapter.addMany
    }
})

// todosAdapter.addOne 等价于 (state, action) => todosAdapter.addOne(action.payload)
```

[更多实体适配器相关API](https://redux-toolkit-cn.netlify.app/api/createEntityAdapter)


实体适配器要求每一个实体必须拥有 id 属性作为唯一标识，如果实体中的唯一标识字段不叫做 id，需要使用 selectId 进行声明。

```javascript
const todosAdapter = createEntityAdapter({ selectId: todo => todo.tid })
```

