class HomeController < ApplicationController
  def index
   @conversions = [
      { name: "Images Converter", type: "image_converter" },
      { name: "Files Converter", type: "pdf_converter" },
      { name: "Image Enhancer", type: "image_editior" },
      { name: "Edit PDF", type: "pdf_editior" },
      { name: "WaterMark", type: "watermark" },
      { name: "Data Remover", type: "data_remover" }
    ]
  end
end
