# frozen_string_literal: true

module Api
  module V1
    class InventoryItemSerializer < ActiveModel::Serializer
      attributes :id, :name
      has_many :repository_cells, key: :inventory_cells,
                                  serializer: InventoryCellSerializer,
                                  class_name: 'RepositoryCell'
    end
  end
end
