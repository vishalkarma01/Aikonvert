if Rails.env.production?
  SolidCable::Engine.config.enabled = false
end
