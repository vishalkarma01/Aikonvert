class ApplicationController < ActionController::Base
  include VisitorTracking
  allow_browser versions: :modern

  before_action :set_user_global

  private

  def set_user_global
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
end
