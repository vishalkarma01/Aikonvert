class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  include VisitorTracking
  allow_browser versions: :modern

  before_action :set_user_global

  private

  def set_user_global
    session[:visitor_id] ||= SecureRandom.uuid

    @user = User.find_or_initialize_by(session_token: session[:visitor_id])

    # If user record is new, initialize default values
    if @user.new_record?
      @user.session_id = session.id
      @user.remaining_coupons ||= 1
      @user.save!
    end
  end
end
