class FileConverterService
  def initialize(file:, target_format:)
    @file = file
    @target_format = target_format
    @input_ext = File.extname(file.original_filename).delete(".").downcase
  end

  def call
    case detect_type
    when :image
      convert_image
    when :document
      convert_document
    when :pdf
      convert_pdf
    else
      raise "Unsupported file type"
    end
  end

  private

  def detect_type
    if @file.content_type.start_with?("image/")
      :image
    elsif %w[doc docx].include?(@input_ext)
      :document
    elsif @input_ext == "pdf"
      :pdf
    else
      :unknown
    end
  end

  # -----------------------------
  # IMAGE CONVERSION
  # -----------------------------
  def convert_image
    require "mini_magick"

    temp_path = "/tmp/converted_#{SecureRandom.hex}.#{@target_format}"
    image = MiniMagick::Image.read(@file)
    image.format @target_format
    image.write temp_path

    File.new(temp_path)
  end

  # -----------------------------
  # DOCUMENT CONVERSION (doc/docx <-> pdf)
  # -----------------------------
  def convert_document
    temp_path = "/tmp/converted_#{SecureRandom.hex}.#{@target_format}"

    # LibreOffice for document conversions
    system("libreoffice --headless --convert-to #{@target_format} --outdir /tmp #{@file.path}")

    output_file = Dir["/tmp/*.#{@target_format}"].max_by { |f| File.mtime(f) }
    raise "Document conversion failed" unless output_file

    File.new(output_file)
  end

  # -----------------------------
  # PDF CONVERSION (pdf → images or pdf → docx)
  # -----------------------------
  def convert_pdf
    if %w[jpg jpeg png webp].include?(@target_format)
      convert_pdf_to_image
    elsif %w[docx doc].include?(@target_format)
      convert_pdf_to_doc
    else
      raise "Unsupported PDF conversion"
    end
  end

  def convert_pdf_to_image
    require "mini_magick"
    temp_path = "/tmp/converted_#{SecureRandom.hex}.#{@target_format}"
    image = MiniMagick::Image.read(@file)
    image.format @target_format
    image.write temp_path
    File.new(temp_path)
  end

  def convert_pdf_to_doc
    temp_path = "/tmp/converted_#{SecureRandom.hex}.#{@target_format}"
    system("libreoffice --headless --convert-to #{@target_format} --outdir /tmp #{@file.path}")
    output_file = Dir["/tmp/*.#{@target_format}"].max_by { |f| File.mtime(f) }
    File.new(output_file)
  end
end
