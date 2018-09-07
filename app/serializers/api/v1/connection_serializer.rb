# frozen_string_literal: true

module Api
  module V1
    class ConnectionSerializer < ActiveModel::Serializer
      type :connection
      attributes :id, :input_id, :output_id
    end
  end
end
