class UsersController < ApplicationController
  before_action :set_user

  # Called automatically on page load (e.g., from JS fetch)
  def ensure_session_user
    # Auto-create if new visitor
    unless @user.persisted?
      @user.remaining_coupons = 1
      @user.save
    end

    render json: {
      success: true,
      session_token: @user.session_token,
      remaining_coupons: @user.remaining_coupons,
      has_account: @user.nickname.present? && @user.email.present?
    }
  end

  # Used when user opens profile
  def info
    render json: {
      has_account: @user.nickname.present? && @user.email.present?,
      nickname: @user.nickname,
      email: @user.email,
      remaining_coupons: @user.remaining_coupons,
      conversions: @user.conversions.order(created_at: :desc).limit(10).map do |c|
        {
          type: c.conversion_type,
          original_file: c.original_file,
          converted_file: c.converted_file,
          created_at: c.created_at.strftime("%d %b %Y, %I:%M %p")
        }
      end
    }
  end

  # Called when user fills create account popup
  def create_account
    if @user.update(user_params.merge(remaining_coupons: @user.remaining_coupons + 10))
      render json: {
        success: true,
        nickname: @user.nickname,
        email: @user.email,
        remaining_coupons: @user.remaining_coupons
      }
    else
      render json: { success: false, errors: @user.errors.full_messages }
    end
  end

  private

  def set_user
  session[:visitor_id] ||= SecureRandom.uuid

    @user = User.find_or_initialize_by(session_token: session[:visitor_id])

    # Assign required defaults if new record
    if @user.new_record?
      @user.session_id = session.id
      @user.remaining_coupons ||= 1
      @user.save!
    end
  end


  def user_params
    params.permit(:nickname, :email)
  end
end
