# app/controllers/concerns/visitor_tracking.rb
module VisitorTracking
  extend ActiveSupport::Concern

  included do
    before_action :ensure_visitor_session
  end

  private

  def ensure_visitor_session
    session[:visitor_id] ||= SecureRandom.uuid
  end
end
