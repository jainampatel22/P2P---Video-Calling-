import {Route,BrowserRouter,Routes} from "react-router-dom"
import { Receiver } from "./components/Reciver";
import { Sender } from "./components/Sender";
function App(){
return(
  <BrowserRouter>
  <Routes>
    <Route path="/sender" element={<Sender/>}></Route>
    <Route path="/reciver" element={<Receiver/>}></Route>
  </Routes>
  </BrowserRouter>
)
}
export default App;