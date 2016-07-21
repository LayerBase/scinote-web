class RemoveKeywordsFromModuleProtocols < ActiveRecord::Migration
  def up
    Protocol.find_each do |p|
      if p.in_module? then
        p.protocol_keywords.destroy_all
      end
    end
  end
end