import { client } from "@gradio/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import FileUpload from "./FileUpload";

const App = () => {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const historyData = localStorage.getItem("history");
    if (historyData) {
      setHistory(JSON.parse(historyData));
    }
  }
  , []);
 
  const setHistoryData = (result,time,image) => {
    //save to local storage
      const newHistory = {
        image: image,
        result: result,
        time: time,
      };
      setHistory([newHistory, ...history]);
      localStorage.setItem("history", JSON.stringify([newHistory, ...history]));

  }

 

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const base64Image = await getBase64Image(file);
    await predict(base64Image);
  };

  const getBase64Image = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const predict = async (exampleImage) => {
    //loading
    Swal.fire({
      title: "Loading",
      html: "กำลังประมวลผลข้อมูล..",
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const app = await client("https://054682dcc8f5df094d.gradio.live");
      const result = await app.predict("/predict", [exampleImage]);
      const tempResult = JSON.stringify(result.data);
      console.log('tempResult', tempResult);
      if(tempResult.length > 0){
        const type = tempResult.includes('Organic') ? 'Organic' : 'Recycle';
        if(type === 'Organic'){
          Swal.fire({
            title: "Organic",
            text: "This is organic waste",
            imageUrl: "/image/organic.png",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "organic",
          });
        }
        else{
          // Swal.fire show image <img src="/image/recycle.png" alt="organic" className="w-14 h-14" />
          Swal.fire({
            title: "Recycle",
            text: "This is recycle waste",
            imageUrl: "/image/recycle.png",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "recycle",
          });
        }
      setHistoryData(result.data[0], new Date().toLocaleString(), exampleImage);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  return (
    <div 
    style={{
backgroundImage: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100vw",
      height: "100vh",
    
    }}
    >
      <div
        className="absolute  bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      rounded-3xl shadow-lg p-4 flex flex-col  space-y-4
  w-[94vw] h-[96vh]  
      sm:w-[80vw] sm:h-[80vh]
      md:w-[70vw] md:h-[80vh]
      lg:w-[44vw] lg:h-[80vh]
      xl:w-[40vw] xl:h-[80vh]
      "
      >
        <div className="flex relative "
        style={{
          marginTop: "-28px"
        }}
        >
          <img src="/image/wastemon.png" alt="logo" className="w-36 h-36 mx-auto" style={{
           marginBottom: "-20px"
          }} />
       
        </div>
        <FileUpload handleFileChange={handleImageChange} />
        
      <div className="flex flex-col space-y-2">
        {history.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-2xl"
          >
            <img
              src={`data:image/png;base64,${item.image}`}
              alt="preview"
              className="w-12 h-12 rounded-lg"
            />
            <p className="text-sm text-gray-500">{item.result}</p>
            <p className="text-sm text-gray-500">{item.time}</p>
          </div>
        ))}
        </div>


      </div>

    </div>
  );
};

export default App;
