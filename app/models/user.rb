class User < ApplicationRecord
  has_many :conversions, dependent: :destroy

  validates :session_id, presence: true, uniqueness: true
  validates :nickname, presence: true, on: :update
  validates :email, presence: true, uniqueness: true, on: :update

  before_update :set_default_coupons

  private

  def set_default_coupons
    self.remaining_coupons ||= 10
  end
end
