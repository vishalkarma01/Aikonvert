require "test_helper"

class ConversionsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get conversions_create_url
    assert_response :success
  end
end
