# frozen_string_literal: true

class TinyMceAssetsController < ApplicationController
  def create
    image = params.fetch(:file) { render_404 }
    tiny_img = TinyMceAsset.new(image: image,
                                team_id: current_team.id,
                                saved: false)
    if tiny_img.save
      render json: {
        image: {
          url: view_context.image_url(tiny_img.url(:large)),
          token: Base62.encode(tiny_img.id)
        }
      }, content_type: 'text/html'
    else
      render json: {
        error: tiny_img.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    image = TinyMceAsset.find_by_id(Base62.decode(params[:id]))
    image.update(image: params[:image])
    render json: { url: view_context.image_url(image.url) }
  end
end
