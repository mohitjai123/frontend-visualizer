import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useThreeScene } from "../useThreeScene";
import ModelStyleSelector from "../ModelStyleSelector";
import ResolutionSelector from "../ResolutionSelector";
import * as THREE from "three";
import { useImageDownload } from "../../dashboard/Download";
import { useImageProcessing } from "../downloadFunction";
import PropertyControls from "../PropertyControl";
import FileDownload from "../../../../public/file_download.svg";

const LungiWithoutShirt = ({
  currentStep,
  item,
  modalWidth = "500px", // Default width
  modalHeight = "800px",
}) => {
  const refContainer = useRef(null);
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [globalProperties, setGlobalProperties] = useState({
    brightness: 0.59,
    contrast: 1,
    saturation: 1,
    exposure: 1,
    shadowStrength: 1.64,
    highlightImprovement: 1.64,
  });

  const initialProperties = {
    brightness: 0.59,
    contrast: 1,
    saturation: 1,
    exposure: 1,
    shadowStrength: 1.64,
    highlightImprovement: 1.64
  };

  const lungiWithoutShirtTexture = useMemo(
    () => ({
      towal: item?.uploadOptions[1]?.image,
      lungi: item?.uploadOptions[0]?.image,
      shirt: item?.uploadOptions[2]?.image,
    }),
    [item]
  );
  const totalCredit = localStorage.getItem("totalCredit");

  // Check if watermark should be displayed in step 3
 const shouldShowWatermark = (currentStep === 2) || (currentStep === 3 && totalCredit <= 10);
  const lungiWithoutShirtTemplate = item?.templates;
  const currentTextures =
    lungiWithoutShirtTexture || productData[1]?.textures[0].layerImage;
    const modelConfigs = useMemo(() => {
      const configs = [
        {
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.add_lungi,
          textureUrl: currentTextures?.lungi,
          shadowTextureUrl: lungiWithoutShirtTemplate[modelIndex]?.shadow_png,
        },
        {
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.add_lungi,
          textureUrl: currentTextures?.lungi,
          shadowTextureUrl: lungiWithoutShirtTemplate[modelIndex]?.shadow_png,
        },
    
        {
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.shirt_fabric,
          textureUrl: currentTextures?.shirt,
          shadowTextureUrl: lungiWithoutShirtTemplate[modelIndex]?.shadow_png,
        },
        {
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.add_towel,
          textureUrl: currentTextures?.towal,
          shadowTextureUrl: lungiWithoutShirtTemplate[modelIndex]?.shadow_png,
        },
        {
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.body_glb,
          textureUrl: lungiWithoutShirtTemplate[modelIndex]?.body_png,
        },
      ];
    
      // Add background model configuration conditionally
      if (lungiWithoutShirtTemplate[modelIndex]?.background_glb) {
        configs.push({
          modelUrl: lungiWithoutShirtTemplate[modelIndex]?.background_glb,
          textureUrl: lungiWithoutShirtTemplate[modelIndex]?.background_png,
        });
      }
    
      return configs;
    }, [modelIndex, currentTextures, lungiWithoutShirtTemplate]);
    

  const additionalInfo = "LungiWithoutShirt";
  const { renderer, scene, camera, loading, updateShaderUniforms } = useThreeScene(
    refContainer,
    modelConfigs,
    globalProperties,
    additionalInfo,
  );

  const handlePropertyChange = useCallback((newProperties) => {
    setGlobalProperties(newProperties);
    updateShaderUniforms(newProperties);
  }, [updateShaderUniforms]);

  const handleChangeModel = useCallback((value) => {
    setModelIndex(value);
    // Apply current global properties to new model
    updateShaderUniforms(globalProperties);
  }, [globalProperties, updateShaderUniforms]);
  const downloadImage = useImageDownload(renderer, scene, camera, item);

  const { processImage } = useImageProcessing(renderer, scene, camera, item);
  useEffect(() => {
    if (currentStep === 3) {
      processImage();
    }
  }, [currentStep, processImage]);


  return (
    <div className="bg-white p-6">
      <div className="flex flex-col md:flex-row justify-center gap-10 items-start bg-white p-4 rounded-lg">
        <div  className="relative w-full md:w-1/2 shirtCanvas flex items-center justify-center overflow-hidden"
  ref={refContainer}
  style={{
    // height: modalHeight,
    visibility: loading ? "hidden" : "visible",
    aspectRatio: "2 / 3", // Set aspect ratio for modern browsers
    maxWidth: "100%", // Responsive width constraint
    height: "auto", // Let height adjust based on aspect ratio
  }}
  >
  {currentStep !== 3 && (
    <div className="absolute top-[-40px] text-2xl font-bold">
      Visualizer Image
    </div>
  )}
  {shouldShowWatermark && (
    <img
      className="absolute top-0 left-0 h-full w-full opacity-100"
      src="/watermark.png"
      alt="Watermark"
    />
  )}
</div>

        {loading && (
          <div className="flex items-center justify-center absolute top-[50%] left-[22%] z-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="ml-2 text-xl font-bold">Loading...</span>
          </div>
        )}

        {currentStep !== 3 ? (
          <div className="flex flex-col gap-6 w-full sm:w-1/2">
            <PropertyControls
              updateShaderUniforms={updateShaderUniforms}
              initialProperties={initialProperties}
              onPropertyChange={handlePropertyChange}
            />
            <ModelStyleSelector
              menShirtTemplate={lungiWithoutShirtTemplate}
              handleChangeModel={handleChangeModel}
              modelIndex={modelIndex}
              item={item}
            />
          </div>
        ) : (
          <ResolutionSelector
            setSelectedMultiplier={setSelectedResolution}
            downloadImage={() => downloadImage(selectedResolution)}
          />
        )}
      </div>

      {currentStep === 3 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => downloadImage(selectedResolution)}
            className="btn-outline font-bold border-[0.063rem] rounded-[0.5rem] flex items-center gap-2 mt-4 mr-[350px]"
          >
            Download
            <img src={FileDownload} alt="Download icon" className="w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LungiWithoutShirt;
