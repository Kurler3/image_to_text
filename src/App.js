import './App.css';
import Tesseract from 'tesseract.js';
import React, {memo, useCallback, useState} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default memo(function App() {
  
  /////////////////
  // STATE ////////
  /////////////////

  const [state, setState] = useState({
    imgSource: null,
    text: '',
    extractLoader: false,
    progress: 0,
  });

  //////////////////
  // FUNCTIONS /////
  //////////////////

  // HANDLE PICK IMG
  const handlePickImg = useCallback((event) => {
    try {
      if(event.target.files.length > 0) {
        setState((prevState) => {
          return {
            ...prevState,
            imgSource: URL.createObjectURL(event.target.files[0]),
            text: '',
          };
        });
      }
     
    } catch (error) {
      console.log("Error while picking img...", error);
    }
  }, []);


  // HANDLE EXTRACT TXT
  const handleExtractTxt = useCallback(async () => {

    try {

      setState((prevState) => {
        return {
          ...prevState,
          extractLoader: true,
        };
      });

      const {data} = await Tesseract.recognize(
        state.imgSource,'eng',
        { 
          logger: m => {
         
            if(m.status && m.status.includes("recognizing text")) {
              setState((prevState) => {
                return {
                  ...prevState,
                  progress: m.progress,
                };
              });
            }
          }
        }
      );

      setState((prevState) => {
        return {
          ...prevState,
          progress: 0,
          extractLoader: false,
          text: data.text,
        };
      });

      if(data.text.length > 0) {
        // SHOW SUCCESS TOAST
        toast.success("Text extracted successfully!");
      }
      else {
        toast.error("Couldn't extract text from this image :/");
      }
      

    } catch (error) {
      console.log("Error extracting text...", error);
      setState((prevState) => {
        return {
          ...prevState,
          text: '',
          extractLoader: false,
        };
      });

      // SHOW TOAST
      toast.error("Something went wrong...please try again");
    }
  }, [state.imgSource]);

  const handleCopyToClipboard = useCallback(() => {
      try {
        // COPY
        navigator.clipboard.writeText(state.text);
        // SHOW SUCCESS TOAST
        toast.success("Extracted text copied successfully!");
      } catch (error) {
        console.log('Error while copying extracted text...', error);
        toast.error("Couldn't copy the text...please try again!");
      }
  }, [state.text]);

  ///////////////////
  // RENDER /////////
  ///////////////////

  return (
    <div className="h-screen w-screen flex flex-col justify-start items-center bg-blue-300 overflow-x-hidden relative">
      
      <div className='text-2xl font-bold my-10'>
        Choose an image from your computer to extract the text from it :D
      </div>

      {/* IMAGE INPUT */}
      <input 
        type="file"
        accept="image/*"
        onChange={handlePickImg}
        className="border p-2 rounded-lg bg-white cursor-pointer"
      />
      
      {/* IMAGE PREVIEW */}
      {
        state.imgSource &&
        <div className='flex flex-col items-center mt-5'>

          {/* PREVIEW */}
          <img 
            alt='chosen_image'
            src={state.imgSource}
            className="h-[300px] w-[300px]"
          />

          {/* CONVERT TO TEXT BTN */}
          <button
            disabled={state.extractLoader}
            onClick={handleExtractTxt}
            className={`
              mt-5 border p-3 bg-white font-semibold rounded-lg hover:bg-gray-300 transition hover:scale-[1.1]
              ${state.extractLoader ? "opacity-[0.6]" : ""}
            `}
          >
            Extract Text
          </button>
        </div>
      }
      
      {/* TEXT EXTRACTION OUTPUT */}
      {
        state.text.length > 0 &&
          <div className='mt-10 w-[80%] border bg-white p-4 rounded-lg shadow-lg relative'>

            {/* CLIPBOARD COPY */}
            <div className='absolute top-2 right-2 material-icons cursor-pointer bg-gray-200 p-2 rounded-lg transition hover:scale-[1.1]'
              title="Copy to clipboard"
              onClick={handleCopyToClipboard}
            >
              content_copy
            </div>


            {/* EXTRACTED TEXT */}
            {state.text}
          </div>
      }
      
      {/* LOADER MODAL */}
      {
        state.extractLoader &&
        <div className='absolute top-0 left-0 w-screen h-screen backdrop-blur-sm z-10 flex justify-center items-center'>
          <div className='bg-white p-3 rounded-lg min-w-[250px] flex flex-col justify-center items-center mb-10 shadow-lg opacityInClass'>
              {/* TITLE */}
              <div className='font-bold text-xl'>
                Extracting the text
              </div>
              {/* PROGRESS BAR */}
              <div
                className='w-[200px] h-[30px] bg-gray-300 mt-2 rounded-xl'
              >
                <div
                  className="h-full bg-green-500 rounded-xl"
                  style={{
                    width: state.progress * 200 + "px"
                  }}
                >
                </div>
              </div>  
          </div>
        </div>
      }


      <ToastContainer 
        position='bottom-right'
        limit={1}
      />

    </div>
  );
});

