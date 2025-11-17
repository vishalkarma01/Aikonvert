# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_17_134544) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "conversions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "conversion_type"
    t.string "original_file"
    t.string "converted_file"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_conversions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "nickname"
    t.string "email"
    t.integer "remaining_coupons"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "session_token"
    t.string "visitor_token"
    t.boolean "guest"
    t.index ["session_token"], name: "index_users_on_session_token"
    t.index ["visitor_token"], name: "index_users_on_visitor_token", unique: true
  end

  add_foreign_key "conversions", "users"
end
