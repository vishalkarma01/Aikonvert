class ConversionsController < ApplicationController
  def create
    if @user.remaining_coupons <= 0
      return render json: {
        success: false,
        error: "no_coupons",
        heading: "Upgrade Required",
        message: "You’ve used all your free coupons. Purchase a premium plan to continue using the converter."
      }
    end
    uploaded_file = params[:file]
    target_format = params[:target_format]

    unless uploaded_file.present? && target_format.present?
      flash[:alert] = "Please select a file and target format."
      redirect_back(fallback_location: root_path) and return
    end

    begin
      converted_file = FileConverterService.new(
        file: uploaded_file,
        target_format: target_format
      ).call

      final_filename = File.basename(converted_file.path)

      send_file converted_file.path,
                filename: final_filename,
                type: mime_type_for(target_format),
                disposition: "attachment"

      @user.remaining_coupons -= 1
      @user.save!
    rescue ArgumentError => e
      flash[:alert] = e.message
      redirect_back(fallback_location: root_path)
    rescue StandardError => e
      Rails.logger.error("Conversion failed: #{e.message}")
      flash[:alert] = "File conversion failed. Please try again."
      redirect_back(fallback_location: root_path)
    end
  end

  private

  def mime_type_for(format)
    case format.downcase
    when "jpeg", "jpg" then "image/jpeg"
    when "png" then "image/png"
    when "gif" then "image/gif"
    when "bmp" then "image/bmp"
    when "tiff" then "image/tiff"
    when "webp" then "image/webp"
    when "heic" then "image/heic"
    when "pdf" then "application/pdf"
    when "docx" then "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    when "doc"  then "application/msword"
    else "application/octet-stream"
    end
  end
end
