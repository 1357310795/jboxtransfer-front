import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/error-page";
import Root from "./pages/root";
import Index from "./pages";
import Start from "./pages/start";
import TaskList from "./pages/task-list";
import Jbox from "./pages/jbox";
import Tbox from "./pages/tbox";
import "@/styles/index.css";

const router = createBrowserRouter([
  {
    path: "/main",
    element: <Root />,
    // loader: rootLoader,
    // action: rootAction,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            path: "start",
            element: <Start />,
          },
          {
            path: "task",
            element: <TaskList />,
          },
          {
            path: "jbox",
            element: <Jbox />,
          },
          {
            path: "tbox",
            element: <Tbox />,
          },
        ],
      },
    ],
  },
  // {
  //   path: "/ref",
  //   element: <Dashboard />,
  // },
  {
    path: "/",
    index: true, 
    element: <Index /> 
  },
  // {
  //   path: "/signin",
  //   element: <SignIn />,
  // },
  // {
  //   path: "/signup",
  //   element: <SignUp />,
  // },
  // {
  //   path: "/s/:shareId",
  //   element: <SharingPage />,
  // },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
