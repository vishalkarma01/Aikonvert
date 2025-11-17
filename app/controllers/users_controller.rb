class UsersController < ApplicationController
  before_action :set_user

  # -----------------------------
  # Initialize or fetch user session
  # -----------------------------
  def ensure_session_user
    render json: user_json
  end

  # -----------------------------
  # Fetch user info
  # -----------------------------
  def info
    render json: user_json.merge(
      conversions: @user.conversions.order(created_at: :desc).limit(10).map do |c|
        {
          type: c.conversion_type,
          original_file: c.original_file,
          converted_file: c.converted_file,
          created_at: c.created_at.strftime("%d %b %Y, %I:%M %p")
        }
      end
    )
  end

  # -----------------------------
  # Create account / upgrade guest
  # -----------------------------
  def create_account
    if @user.update(user_params.merge(guest: false, remaining_coupons: @user.remaining_coupons + 10))
      render json: user_json
    else
      render json: { success: false, errors: @user.errors.full_messages }
    end
  end

  # -----------------------------
  # Use a coupon for a conversion
  # -----------------------------
  def use_coupon
    if @user.remaining_coupons > 0
      @user.decrement!(:remaining_coupons)
      render json: { success: true, remaining_coupons: @user.remaining_coupons }
    else
      render json: { success: false, message: "No coupons left" }
    end
  end

  private

  # -----------------------------
  # Set or create user based on permanent signed cookie
  # -----------------------------
  def set_user
    # Use permanent signed cookie for persistent sessions
    cookies.permanent.signed[:visitor_token] ||= SecureRandom.uuid

    # Find or initialize user by session_token
    @user = User.find_or_initialize_by(session_token: cookies.signed[:visitor_token])

  if @user.new_record?
    @user.remaining_coupons ||= 1
    @user.guest = true if @user.guest.nil?
    @user.save!
  end
end






  # -----------------------------
  # Strong params
  # -----------------------------
  def user_params
    params.permit(:nickname, :email)
  end

  # -----------------------------
  # JSON for frontend
  # -----------------------------
  def user_json
    {
      success: true,
      session_token: @user.session_token,
      remaining_coupons: @user.remaining_coupons,
      nickname: @user.nickname,
      email: @user.email,
      has_account: @user.nickname.present? && @user.email.present?
    }
  end
end
