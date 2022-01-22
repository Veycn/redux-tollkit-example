import {createAsyncThunk, createSlice, createEntityAdapter, createSelector} from '@reduxjs/toolkit'
import axios from "axios";
export const TODOS_FEATURE_KEY = 'todos'


export const loadTodos = createAsyncThunk('todos/loadTodos', (payload, thunkAPI) => {
    return axios.get('http://localhost:3001/todos').then(res => res.data)
})


const todosAdapter = createEntityAdapter()

const {reducer: TodosReducer, actions} = createSlice({
    name: TODOS_FEATURE_KEY,
    initialState: todosAdapter.getInitialState(),
    reducers: {
        addTodo: {
            reducer: todosAdapter.addOne,
            prepare: todo => {
                return { payload: { ...todo, id: Math.random() } }
            }
        },
        setTodos: todosAdapter.addMany,
        deleteTodo: todosAdapter.removeOne,
        changeTodoState: todosAdapter.updateOne
    },
    extraReducers: {
        [loadTodos.fulfilled]: todosAdapter.addMany,
        [loadTodos.pending]: (state, action) => {
            return state
        },
        [loadTodos.rejected]: (state, action) => {},
    }
})


const { selectAll } = todosAdapter.getSelectors()
export const selectAllTodos = createSelector(state => state[TODOS_FEATURE_KEY], selectAll)

export const {addTodo, setTodos, deleteTodo, changeTodoState} = actions
export default TodosReducer
