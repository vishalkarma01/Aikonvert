# app/services/converters/image_converter.rb
require "mini_magick"
require "tempfile"
require "logger"

module Converters
  class ImageConverter
    SUPPORTED_FORMATS = %w[jpeg jpg png bmp gif tiff webp heic].freeze

    def initialize(file, target_format)
      @file = file
      @target_format = target_format.to_s.downcase
      @logger = Logger.new(Rails.root.join("log", "image_converter.log"))

      validate_target_format
      validate_file_presence
    end

    # Main method to perform conversion
    # Returns a Tempfile with the converted image
    def call
      begin
        image = MiniMagick::Image.read(@file.tempfile)

        # Optional: validate input image type
        unless SUPPORTED_FORMATS.include?(image.type.downcase)
          raise "Unsupported source image format: #{image.type}"
        end

        # Convert to target format
        image.format @target_format

        # Save to Tempfile
        output = Tempfile.new([ "converted", ".#{@target_format}" ])
        image.write(output.path)
        output.binmode # ensure binary mode

        @logger.info("Image converted successfully: #{@file.original_filename} → .#{@target_format}")
        output
      rescue MiniMagick::Error => e
        @logger.error("MiniMagick error: #{e.message}")
        raise "Failed to process image. Please check the file or try another format."
      rescue => e
        @logger.error("Image conversion failed: #{e.message}")
        raise "Image conversion failed: #{e.message}"
      end
    end

    private

    # Ensure the target format is supported
    def validate_target_format
      unless SUPPORTED_FORMATS.include?(@target_format)
        raise ArgumentError, "Unsupported target format: #{@target_format}. Supported formats: #{SUPPORTED_FORMATS.join(', ')}"
      end
    end

    # Ensure file is present
    def validate_file_presence
      if @file.nil? || !@file.respond_to?(:tempfile)
        raise ArgumentError, "No file uploaded or invalid file."
      end
    end
  end
end
